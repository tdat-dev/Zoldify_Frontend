<?php

declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Models\EscrowHold;
use App\Models\User;

/**
 * WalletController - Quản lý Ví & Tài chính cho Admin
 * 
 * Chức năng:
 * - Xem danh sách ví sellers
 * - Xem chi tiết giao dịch
 * - Duyệt/từ chối yêu cầu rút tiền
 * - Xem escrow đang giữ
 * 
 * @package App\Controllers\Admin
 */
class WalletController extends AdminBaseController
{
    private Wallet $walletModel;
    private WalletTransaction $transModel;
    private EscrowHold $escrowModel;

    public function __construct()
    {
        parent::__construct();
        $this->walletModel = new Wallet();
        $this->transModel = new WalletTransaction();
        $this->escrowModel = new EscrowHold();
    }

    /**
     * Danh sách ví có số dư
     */
    public function index()
    {
        $page = max(1, (int) ($_GET['page'] ?? 1));
        $limit = 20;
        $offset = ($page - 1) * $limit;

        // Lấy danh sách ví có balance > 0
        $wallets = $this->walletModel->getAllWithBalance($limit, $offset);

        // Thống kê tổng quan
        $stats = $this->walletModel->getSystemStats();

        $this->view('wallets/index', [
            'title' => 'Quản lý Ví',
            'wallets' => $wallets,
            'stats' => $stats,
            'page' => $page
        ]);
    }

    /**
     * Chi tiết ví + lịch sử giao dịch
     */
    public function show()
    {
        $id = (int) ($_GET['id'] ?? 0);

        if (!$id) {
            $_SESSION['error'] = 'ID ví không hợp lệ';
            header('Location: /admin/wallets');
            exit;
        }

        $wallet = $this->walletModel->find($id);

        if (!$wallet) {
            $_SESSION['error'] = 'Ví không tồn tại';
            header('Location: /admin/wallets');
            exit;
        }

        // Lấy thông tin user
        $userModel = new User();
        $user = $userModel->find($wallet['user_id']);

        // Lấy transactions
        $transactions = $this->transModel->getByWalletId($id, 50);

        // Thống kê theo loại
        $statsByType = $this->transModel->getStatsByType($id);

        $this->view('wallets/show', [
            'title' => 'Chi tiết Ví #' . $id,
            'wallet' => $wallet,
            'user' => $user,
            'transactions' => $transactions,
            'statsByType' => $statsByType
        ]);
    }

    /**
     * Danh sách yêu cầu rút tiền chờ duyệt
     */
    public function withdrawals()
    {
        $pending = $this->transModel->getPendingWithdrawals();

        $this->view('wallets/withdrawals', [
            'title' => 'Yêu cầu Rút tiền',
            'withdrawals' => $pending
        ]);
    }

    /**
     * Duyệt yêu cầu rút tiền
     */
    public function approveWithdrawal()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            header('Location: /admin/wallets/withdrawals');
            exit;
        }

        $id = (int) ($_POST['id'] ?? 0);
        $referenceId = trim($_POST['reference_id'] ?? '');

        if (!$id) {
            $_SESSION['error'] = 'ID giao dịch không hợp lệ';
            header('Location: /admin/wallets/withdrawals');
            exit;
        }

        $success = $this->transModel->approveWithdrawal($id, $referenceId ?: null);

        if ($success) {
            $_SESSION['success'] = 'Đã duyệt yêu cầu rút tiền!';
        } else {
            $_SESSION['error'] = 'Duyệt thất bại. Vui lòng kiểm tra lại.';
        }

        header('Location: /admin/wallets/withdrawals');
        exit;
    }

    /**
     * Từ chối yêu cầu rút tiền
     */
    public function rejectWithdrawal()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            header('Location: /admin/wallets/withdrawals');
            exit;
        }

        $id = (int) ($_POST['id'] ?? 0);
        $reason = trim($_POST['reason'] ?? 'Không đủ điều kiện');

        if (!$id) {
            $_SESSION['error'] = 'ID giao dịch không hợp lệ';
            header('Location: /admin/wallets/withdrawals');
            exit;
        }

        $success = $this->transModel->rejectWithdrawal($id, $reason);

        if ($success) {
            $_SESSION['success'] = 'Đã từ chối và hoàn tiền về ví!';
        } else {
            $_SESSION['error'] = 'Từ chối thất bại.';
        }

        header('Location: /admin/wallets/withdrawals');
        exit;
    }

    /**
     * Danh sách Escrow đang giữ
     */
    public function escrow()
    {
        $status = $_GET['status'] ?? null;
        $escrows = $this->escrowModel->getAllWithDetails(50, 0, $status);

        // Thống kê
        $stats = $this->escrowModel->getStats();
        $totalHolding = $this->escrowModel->getTotalHolding();

        $this->view('wallets/escrow', [
            'title' => 'Quản lý Escrow',
            'escrows' => $escrows,
            'stats' => $stats,
            'totalHolding' => $totalHolding,
            'currentStatus' => $status
        ]);
    }
}
