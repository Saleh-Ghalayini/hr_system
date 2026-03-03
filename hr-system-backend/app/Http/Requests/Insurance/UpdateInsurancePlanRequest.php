<?php

namespace App\Http\Requests\Insurance;

use App\Http\Requests\BaseFormRequest;

class UpdateInsurancePlanRequest extends BaseFormRequest
{
    public function rules(): array
    {
        return [
            'value' => 'required|numeric|min:0|max:100000',
        ];
    }
}
