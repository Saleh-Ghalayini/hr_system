<?php

namespace App\Http\Requests\Regulation;

use App\Http\Requests\BaseFormRequest;

class RegulationRequest extends BaseFormRequest
{
    public function rules(): array
    {
        $required = $this->isMethod('POST') ? 'required' : 'sometimes';

        return [
            'name'           => "{$required}|string|max:255",
            'description'    => 'nullable|string',
            'jurisdiction'   => "{$required}|string|max:255",
            'effective_date' => "{$required}|date",
        ];
    }
}
