<?php

declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Models\Review;
use App\Models\Product;
use App\Models\User;

/**
 * ReviewController - Quản lý Đánh giá cho Admin
 */
class ReviewController extends AdminBaseController
{
    private Review $reviewModel;

    public function __construct()
    {
        parent::__construct();
        $this->reviewModel = new Review();
    }

    /**
     * Danh sách đánh giá
     */
    public function index()
    {
        $rating = isset($_GET['rating']) ? (int) $_GET['rating'] : null;
        $page = max(1, (int) ($_GET['page'] ?? 1));
        $limit = 20;
        $offset = ($page - 1) * $limit;

        // Lấy tất cả reviews
        $reviews = $this->reviewModel->getAllForAdmin($limit, $offset, $rating);

        // Thống kê theo rating
        $ratingStats = $this->reviewModel->getRatingStats();

        $this->view('reviews/index', [
            'title' => 'Quản lý Đánh giá',
            'reviews' => $reviews,
            'ratingStats' => $ratingStats,
            'currentRating' => $rating,
            'page' => $page
        ]);
    }

    /**
     * Xóa đánh giá vi phạm
     */
    public function delete()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            header('Location: /admin/reviews');
            exit;
        }

        $id = (int) ($_POST['id'] ?? 0);

        if (!$id) {
            $_SESSION['error'] = 'ID đánh giá không hợp lệ';
            header('Location: /admin/reviews');
            exit;
        }

        $result = $this->reviewModel->delete($id);

        if ($result) {
            $_SESSION['success'] = 'Đã xóa đánh giá!';
        } else {
            $_SESSION['error'] = 'Xóa thất bại';
        }

        header('Location: /admin/reviews');
        exit;
    }
}
