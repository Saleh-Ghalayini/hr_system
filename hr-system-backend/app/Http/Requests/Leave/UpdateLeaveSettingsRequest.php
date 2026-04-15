<?php

namespace App\Http\Requests\Leave;

use App\Http\Requests\BaseFormRequest;

class UpdateLeaveSettingsRequest extends BaseFormRequest
{
    public function rules(): array
    {
        return [
            'types' => 'required|array|min:1',
            'types.*.name' => 'required|string|exists:leave_types,name',
            'types.*.max_days' => 'required|integer|min:0|max:365',
            'types.*.is_balance_exempt' => 'required|boolean',
        ];
    }
}
