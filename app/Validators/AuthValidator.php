<?php
namespace App\Validators;

class AuthValidator
{
    public function validateRegister($data)
    {
        $errors = [];

        // Kiểm tra họ tên
        if (empty($data['username'])) {
            $errors['username'] = 'Vui lòng nhập họ tên';
        } else {
            $fullname = trim($data['username']);

            // Kiểm tra độ dài (2-100 ký tự)
            $length = mb_strlen($fullname, 'UTF-8');
            if ($length < 2 || $length > 100) {
                $errors['username'] = 'Họ tên phải từ 2 đến 100 ký tự';
            }
            // Kiểm tra chỉ chứa chữ cái (bao gồm tiếng Việt) và khoảng trắng
            elseif (!preg_match('/^[\p{L}\s]+$/u', $fullname)) {
                $errors['username'] = 'Họ tên chỉ được chứa chữ cái và khoảng trắng';
            }
            // Kiểm tra phải có ít nhất 2 từ (họ và tên)
            elseif (count(preg_split('/\s+/', $fullname)) < 2) {
                $errors['username'] = 'Vui lòng nhập đầy đủ họ và tên';
            }
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

    public function validateLogin($data)
    {
        $errors = [];
        if (empty($data['username']))
            $errors['username'] = 'Thiếu email';
        if (empty($data['password']))
            $errors['password'] = 'Thiếu mật khẩu';
        return $errors;
    }
}