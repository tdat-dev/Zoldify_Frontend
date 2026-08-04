<?php

namespace App\Controllers;

use App\Middleware\VerificationMiddleware;

class ChatController extends BaseController
{
    public function index()
    {
        VerificationMiddleware::requireVerified();
        // Require login for chat
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }

        if (!isset($_SESSION['user'])) {
            // Redirect to login handled by middleware ideally, but basic check here
            header('Location: /login');
            exit;
        }

        $this->view('chat/index');
    }
}
