from rest_framework import viewsets, generics, parsers, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import authenticate, login
import jwt
from rest_framework.views import APIView
from django.conf import settings
from courseoutline import perms
from courseoutline import serializers
from courseoutline.models import Course, Category, Outline, Lesson, Account, Approval


# from rest_framework.permissions import IsAdminUser


class CategoryViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = serializers.CategorySerializer


class CourseViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Course.objects.filter(active=True)
    serializer_class = serializers.CourseSerializer


class LessonViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Lesson.objects.filter(active=True)
    serializer_class = serializers.LessonSerializer


class OutlineViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Outline.objects.filter(active=True)
    serializer_class = serializers.OutlineSerializer

    def get_queryset(self):
        queryset = self.queryset

        if self.action.__eq__('list'):
            q = self.request.query_params.get('q')  # tìm đề cương theo tên
            if q:
                queryset = queryset.filter(name__icontains=q)

            credit = self.request.query_params.get('credit')  # tìm đề cương theo tín chỉ
            if credit:
                queryset = queryset.filter(credit__icontains=credit)

            lecturer = self.request.query_params.get('lecturer')  # tìm đề cương theo tên giảng viên
            if lecturer:
                queryset = queryset.filter(lecturer_id=lecturer)

            course = self.request.query_params.get('course')  # tìm đề cương theo khóa học
            if course:
                queryset = queryset.filter(course=course)
        return queryset

    @action(methods=['get'], url_path='comments', detail=True)
    def add_comment(self):
        pass

    @action(methods=['post'], url_path='add', detail=False)
    def add_outline(self):
        pass

    @action(methods=['post'], url_path='evaluation', detail=True)
    def add_evaluation(self):
        pass


class LoginViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Account.objects.filter(is_active=True)
    serializer_class = serializers.AccountSerializer

    @action(methods=['post'], detail=False, url_path='login')
    def login_view(request):
        username = request.data.get('username')
        password = request.data.get('password')

        account = authenticate(request, username=username, password=password)
        if account is not None:
            if account.is_approved:
                login(request, account)
                token = jwt.encode({'account_id': account.id, 'role': account.role})
                serializer = serializers.AccountSerializer(account)
                return Response({'token': token, 'account': serializer.data}, status=status.HTTP_200_OK)
            else:
                return Response({'error': 'Tài khoản chưa được phê duyệt'}, status=status.HTTP_401_UNAUTHORIZED)
        else:
            return Response({'error': 'Sai tên đăng nhập hoặc mật khẩu'}, status=status.HTTP_401_UNAUTHORIZED)


class AccountViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView):
    queryset = Account.objects.filter(is_active=True)
    serializer_class = serializers.AccountSerializer
    parser_classes = [parsers.MultiPartParser, ]

    def get_permissions(self):
        if self.action in ['get_pending', 'approve_account_lecturer']:
            return [perms.IsAdminPerms()]
        return [permissions.AllowAny()]

    @action(methods=['get'], detail=False, url_path='pending')
    def get_pending(self, request):  # Quan tri vien
        accounts = self.queryset.filter(is_approved=False)
        return Response(serializers.AccountSerializer(accounts, many=True).data, status=status.HTTP_200_OK)

    @action(methods=['post'], detail=False, url_path='lecturer')
    def create_account_lecturer(self, request):  # Giang vien
        serializer = serializers.LecturerAccountSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(data={"message": "Dang ky thanh cong, cho xet duyet", "account": serializer.data},
                        status=status.HTTP_201_CREATED)

    @action(methods=['post'], detail=True, url_path='confirm')
    def approve_account_lecturer(self, request, pk=None):  # Quan tri vien
        account = self.get_object()
        account.is_approved = True
        account.save()
        return Response(data={'message': f'Tài khoản của {account.username} đã được xét duyệt thành công.'},
                        status=status.HTTP_200_OK)


class ApprovalViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Approval.objects.filter(active=True)
    serializer_class = serializers.ApprovalSerializer

    def get_permissions(self):
        if self.action in ['approve_student_request']:
            return [perms.IsAdminPerms()]
        return [permissions.AllowAny()]

    @action(methods=['post'], detail=False, url_path='student')
    def student_request(self, request):  # Sinh viên
        serializer = serializers.ApprovalSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(data={"message": "Gui yeu cau thanh cong", "approval": serializer.data},
                        status=status.HTTP_200_OK)

    @action(methods=['post'], detail=True, url_path='confirm')
    def approve_student_request(self, request, pk=None):  # Quản trị viên
        data = {
            "email": request.data.get('email'),
            "username": request.data.get('username'),
            "password": request.data.get('password'),
        }
        approve = self.get_object()
        code = approve.student.code
        data['code'] = code
        serializer = serializers.StudentAccountSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        approve.is_approved = True
        approve.save()
        return Response(data={"message": "Xét duyệt thành công", "account": serializer.data})

    @action(methods=['put'], detail=True, url_path='update')
    def update_student_account(self, request, pk=None): #Sinh Viên
        approve = self.get_object()
        student_account = approve.student

        serializer = serializers.StudentAccountSerializer(student_account, data=request.data, parial=True)
        serializer.is_valid(raise_exception=True)
        #Cập nhât avatar
        if 'avatar' in request.data:
            student_account.avatar = request.data['avatar']
        else:
            return Response(data={"error": "Vui lòng cập nhật avatar"}, status=status.HTTP_400_BAD_REQUEST)
        # Cập nhật password
        if 'password' in request.data:
            student_account.set_password(request.data['password'])
        else:
            return Response(data={"error": "Vui lòng cập nhật mật khẩu"}, status=status.HTTP_400_BAD_REQUEST)

        serializer.save()

        return Response(data={"message": "Cập nhật tài khoản thành công", "account": serializer.data})