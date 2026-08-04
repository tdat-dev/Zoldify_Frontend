<?php
namespace App\Services;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

class EmailService
{
    private array $config;
    private PHPMailer $mailer;

    public function __construct()
    {
        $this->config = require __DIR__ . '/../../config/mail.php';
        $this->initMailer();
    }

    private function initMailer(): void
    {
        $this->mailer = new PHPMailer(true);

        // Cấu hình SMTP
        $this->mailer->isSMTP();
        $this->mailer->Host = $this->config['host'];
        $this->mailer->SMTPAuth = true;
        $this->mailer->Username = $this->config['username'];
        $this->mailer->Password = $this->config['password'];
        $this->mailer->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $this->mailer->Port = $this->config['port'];

        // Cấu hình người gửi
        $this->mailer->setFrom(
            $this->config['from_address'],
            $this->config['from_name']
        );

        // Hỗ trợ UTF-8 cho tiếng Việt
        $this->mailer->CharSet = 'UTF-8';
    }

    /**
     * Gửi email xác minh với cả link và mã OTP
     */
    public function sendVerificationEmail(string $toEmail, string $toName, string $token, string $otp): bool
    {
        try {
            $this->mailer->clearAddresses();
            $this->mailer->addAddress($toEmail, $toName);

            $this->mailer->isHTML(true);
            $this->mailer->Subject = 'Xác minh tài khoản Zoldify của bạn';

            // Tạo link xác minh
            $verifyLink = $this->getBaseUrl() . "/verify-email/token?token=" . $token;

            // Nội dung HTML
            $this->mailer->Body = $this->buildVerificationEmailBody($toName, $verifyLink, $otp);

            // Nội dung text (fallback)
            $this->mailer->AltBody = "Xin chào {$toName},\n\nMã xác minh của bạn là: {$otp}\n\nHoặc click link: {$verifyLink}";

            $this->mailer->send();
            return true;

        } catch (Exception $e) {
            // Log lỗi (trong production nên dùng logger)
            error_log("Email Error: " . $this->mailer->ErrorInfo);
            return false;
        }
    }

    private function buildVerificationEmailBody(string $name, string $link, string $otp): string
    {
        return <<<HTML
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px;">
                <h1 style="color: #333; text-align: center;">Chào mừng đến với Zoldify!</h1>
                
                <p>Xin chào <strong>{$name}</strong>,</p>
                
                <p>Cảm ơn bạn đã đăng ký tài khoản. Vui lòng xác minh email của bạn bằng một trong hai cách:</p>
                
                <h3>Cách 1: Nhập mã OTP</h3>
                <div style="background: #f0f0f0; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #333;">{$otp}</span>
                </div>
                
                <h3>Cách 2: Click vào link</h3>
                <div style="text-align: center; margin: 20px 0;">
                    <a href="{$link}" style="display: inline-block; background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                        Xác minh Email
                    </a>
                </div>
                
                <p style="color: #666; font-size: 14px;">
                    <strong>Lưu ý:</strong> Link và mã này sẽ hết hạn sau <strong>1 giờ</strong>.
                </p>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                
                <p style="color: #999; font-size: 12px; text-align: center;">
                    Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này.
                </p>
            </div>
        </body>
        </html>
        HTML;
    }

    private function getBaseUrl(): string
    {
        $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'] ?? 'localhost:8000';
        return "{$protocol}://{$host}";
    }
}