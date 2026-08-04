<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Models\UserAddress;
use App\Middleware\VerificationMiddleware;
use App\Services\GHNService;

/**
 * Address Controller
 * 
 * CRUD địa chỉ giao hàng với tích hợp GHN và HERE Maps.
 * 
 * @package App\Controllers
 */
class AddressController extends BaseController
{
    private UserAddress $addressModel;
    private GHNService $ghnService;

    public function __construct()
    {
        parent::__construct();
        $this->addressModel = new UserAddress();
        $this->ghnService = new GHNService();
    }

    // =========================================================================
    // GHN API ENDPOINTS (cho dropdown địa chỉ)
    // =========================================================================

    /**
     * API lấy danh sách Tỉnh/Thành phố từ GHN
     */
    public function getProvinces(): void
    {
        header('Content-Type: application/json');

        try {
            $provinces = $this->ghnService->getProvinces();

            // Filter bỏ dữ liệu test từ GHN sandbox
            $provinces = array_filter($provinces, function ($p) {
                $name = strtolower($p['ProvinceName'] ?? '');
                return strpos($name, 'test') === false;
            });

            echo json_encode(['success' => true, 'data' => array_values($provinces)]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
    }

    /**
     * API lấy danh sách Quận/Huyện từ GHN
     */
    public function getDistricts(): void
    {
        header('Content-Type: application/json');

        $provinceId = (int) $this->query('province_id', 0);

        if ($provinceId <= 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'province_id is required']);
            return;
        }

        try {
            $districts = $this->ghnService->getDistricts($provinceId);
            echo json_encode(['success' => true, 'data' => $districts]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
    }

    /**
     * API lấy danh sách Phường/Xã từ GHN
     */
    public function getWards(): void
    {
        header('Content-Type: application/json');

        $districtId = (int) $this->query('district_id', 0);

        if ($districtId <= 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'district_id is required']);
            return;
        }

        try {
            $wards = $this->ghnService->getWards($districtId);
            echo json_encode(['success' => true, 'data' => $wards]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
    }

    // =========================================================================
    // CRUD METHODS
    // =========================================================================

    /**
     * Danh sách địa chỉ
     */
    public function index(): void
    {
        VerificationMiddleware::requireVerified();
        $user = $this->requireAuth();

        $this->view('addresses/index', [
            'addresses' => $this->addressModel->getByUserId((int) $user['id']),
            'pageTitle' => 'Địa chỉ giao hàng',
        ]);
    }

    /**
     * Form thêm địa chỉ mới
     */
    public function create(): void
    {
        VerificationMiddleware::requireVerified();
        $this->requireAuth();

        $this->view('addresses/create', [
            'pageTitle' => 'Thêm địa chỉ mới',
        ]);
    }

    /**
     * Lưu địa chỉ mới
     */
    public function store(): void
    {
        VerificationMiddleware::requireVerified();
        $user = $this->requireAuth();
        $userId = (int) $user['id'];

        $errors = $this->validateAddressInput($_POST);
        if (!empty($errors)) {
            $_SESSION['errors'] = $errors;
            $_SESSION['old'] = $_POST;
            $this->redirect('/addresses/create');
        }

        $data = $this->prepareAddressData($_POST, $userId);

        try {
            $this->addressModel->createAddress($data);
            $_SESSION['success'] = 'Đã thêm địa chỉ mới thành công!';

            $redirectTo = $this->input('redirect_to');
            $this->redirect($redirectTo ?? '/addresses');
        } catch (\Exception $e) {
            $_SESSION['error'] = 'Có lỗi xảy ra, vui lòng thử lại';
            $_SESSION['old'] = $_POST;
            $this->redirect('/addresses/create');
        }
    }

    /**
     * Form sửa địa chỉ
     */
    public function edit(): void
    {
        VerificationMiddleware::requireVerified();
        $user = $this->requireAuth();

        $addressId = (int) $this->query('id', 0);
        $address = $this->addressModel->findById($addressId, (int) $user['id']);

        if ($address === null) {
            $_SESSION['error'] = 'Không tìm thấy địa chỉ';
            $this->redirect('/addresses');
        }

        $this->view('addresses/edit', [
            'address' => $address,
            'pageTitle' => 'Sửa địa chỉ',
        ]);
    }

    /**
     * Cập nhật địa chỉ
     */
    public function update(): void
    {
        VerificationMiddleware::requireVerified();
        $user = $this->requireAuth();
        $userId = (int) $user['id'];

        $addressId = (int) $this->input('id', 0);

        $errors = $this->validateAddressInput($_POST);
        if (!empty($errors)) {
            $_SESSION['errors'] = $errors;
            $_SESSION['old'] = $_POST;
            $this->redirect("/addresses/edit?id={$addressId}");
        }

        $data = $this->prepareAddressData($_POST);

        try {
            $result = $this->addressModel->updateAddress($addressId, $data, $userId);

            if ($result) {
                $_SESSION['success'] = 'Đã cập nhật địa chỉ thành công!';
            } else {
                $_SESSION['error'] = 'Không thể cập nhật địa chỉ';
            }

            // Redirect về trang trước nếu có (ví dụ: checkout)
            $redirectTo = $this->input('redirect_to');
            $this->redirect($redirectTo ?? '/addresses');
        } catch (\Exception $e) {
            $_SESSION['error'] = 'Có lỗi xảy ra, vui lòng thử lại';
            $this->redirect("/addresses/edit?id={$addressId}");
        }
    }

    /**
     * Xóa địa chỉ
     */
    public function delete(): void
    {
        VerificationMiddleware::requireVerified();
        $user = $this->requireAuth();

        $addressId = (int) $this->input('id', 0);

        try {
            $result = $this->addressModel->deleteAddress($addressId, (int) $user['id']);

            if ($result) {
                $_SESSION['success'] = 'Đã xóa địa chỉ thành công!';
            } else {
                $_SESSION['error'] = 'Không thể xóa địa chỉ';
            }
        } catch (\Exception $e) {
            $_SESSION['error'] = 'Có lỗi xảy ra, vui lòng thử lại';
        }

        $this->redirect('/addresses');
    }

    /**
     * Đặt địa chỉ làm mặc định
     */
    public function setDefault(): void
    {
        VerificationMiddleware::requireVerified();
        $user = $this->requireAuth();

        $addressId = (int) $this->input('id', 0);

        try {
            $result = $this->addressModel->setAsDefault($addressId, (int) $user['id']);

            if ($result) {
                $_SESSION['success'] = 'Đã đặt địa chỉ mặc định!';
            } else {
                $_SESSION['error'] = 'Không thể đặt mặc định';
            }
        } catch (\Exception $e) {
            $_SESSION['error'] = 'Có lỗi xảy ra, vui lòng thử lại';
        }

        $this->redirect('/addresses');
    }

    // =========================================================================
    // PRIVATE HELPERS
    // =========================================================================

    /**
     * Validate input địa chỉ
     * 
     * @return array<string, string> Errors
     */
    private function validateAddressInput(array $data): array
    {
        $errors = [];

        if (empty($data['recipient_name'])) {
            $errors['recipient_name'] = 'Vui lòng nhập tên người nhận';
        }

        if (empty($data['phone_number'])) {
            $errors['phone_number'] = 'Vui lòng nhập số điện thoại';
        } elseif (!preg_match('/^(0|\+84)[0-9]{9,10}$/', preg_replace('/\s+/', '', $data['phone_number']))) {
            $errors['phone_number'] = 'Số điện thoại không hợp lệ';
        }

        if (empty($data['province'])) {
            $errors['province'] = 'Vui lòng chọn Tỉnh/Thành phố';
        }

        if (empty($data['district'])) {
            $errors['district'] = 'Vui lòng chọn Quận/Huyện';
        }

        if (empty($data['street_address'])) {
            $errors['street_address'] = 'Vui lòng nhập địa chỉ chi tiết';
        }

        return $errors;
    }

    /**
     * Chuẩn bị dữ liệu địa chỉ từ POST
     * 
     * @return array<string, mixed>
     */
    private function prepareAddressData(array $post, ?int $userId = null): array
    {
        $data = [
            'label' => trim($post['label'] ?? 'Địa chỉ mới'),
            'recipient_name' => trim($post['recipient_name']),
            'phone_number' => trim($post['phone_number']),
            'province' => trim($post['province']),
            'district' => trim($post['district']),
            'ward' => trim($post['ward'] ?? ''),
            'street_address' => trim($post['street_address']),
            'full_address' => trim($post['full_address'] ?? ''),
            'latitude' => !empty($post['latitude']) ? (float) $post['latitude'] : null,
            'longitude' => !empty($post['longitude']) ? (float) $post['longitude'] : null,
            'here_place_id' => $post['here_place_id'] ?? null,
            'is_default' => !empty($post['is_default']) ? 1 : 0,
            // GHN codes cho vận chuyển
            'ghn_province_id' => !empty($post['ghn_province_id']) ? (int) $post['ghn_province_id'] : null,
            'ghn_district_id' => !empty($post['ghn_district_id']) ? (int) $post['ghn_district_id'] : null,
            'ghn_ward_code' => !empty($post['ghn_ward_code']) ? trim($post['ghn_ward_code']) : null,
        ];

        if ($userId !== null) {
            $data['user_id'] = $userId;
        }

        return $data;
    }
}
