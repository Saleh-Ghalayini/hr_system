<?php

namespace App\Http\Requests\User;

use App\Http\Requests\BaseFormRequest;

class UpdateJobDetailsRequest extends BaseFormRequest
{
    public function rules(): array
    {
        return [
            'title'             => 'sometimes|string|max:255',
            'employment_type'   => 'sometimes|in:full_time,part_time,contract,internship',
            'employment_status' => 'sometimes|in:active,terminated',
            'employee_level'    => 'sometimes|string|max:100',
            'work_location'     => 'sometimes|in:on_site,remote,hybrid',
            'hiring_date'       => 'sometimes|date',
        ];
    }
}
