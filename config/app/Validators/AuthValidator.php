<?php
namespace App\Validators;

class AuthValidator {
    public function validateRegister($data) {
        $errors = [];
        
        // Kiểm tra tên
        if (empty($data['username'])) {
            $errors['username'] = 'Vui lòng nhập họ tên';
        }

        // Kiểm tra email
        if (empty($data['email'])) {
            $errors['email'] = 'Vui lòng nhập email';
        } elseif (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'Email không hợp lệ';
        }

        // Kiểm tra password
        if (empty($data['password'])) {
            $errors['password'] = 'Vui lòng nhập mật khẩu';
        } elseif (strlen($data['password']) < 6) {
            $errors['password'] = 'Mật khẩu phải từ 6 ký tự';
        }

        return $errors;
    }

    public function validateLogin($data) {
        $errors = [];
        if (empty($data['username'])) $errors['username'] = 'Thiếu email';
        if (empty($data['password'])) $errors['password'] = 'Thiếu mật khẩu';
        return $errors;
    }
}