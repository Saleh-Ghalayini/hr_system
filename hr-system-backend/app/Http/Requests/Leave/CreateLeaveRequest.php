<?php

namespace App\Http\Requests\Leave;

use App\Http\Requests\BaseFormRequest;

class CreateLeaveRequest extends BaseFormRequest
{
    public function rules(): array
    {
        return [
            'leave_type'      => 'required|in:annual,sick,casual,other,pto,unpaid,maternity,paternity,bereavement',
            'start_date'      => 'required|date|after_or_equal:today',
            'end_date'        => 'required|date|after_or_equal:start_date',
            'reason'          => 'required|string|max:1000',
            'document'        => 'prohibited',
            'is_half_day'     => 'nullable|boolean',
            'half_day_period' => 'nullable|in:morning,afternoon|required_if:is_half_day,true|prohibited_unless:is_half_day,true',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $isHalfDay = filter_var($this->input('is_half_day', false), FILTER_VALIDATE_BOOLEAN);

            if (!$isHalfDay) {
                return;
            }

            $startDate = $this->input('start_date');
            $endDate = $this->input('end_date');

            if ($startDate && $endDate && $startDate !== $endDate) {
                $validator->errors()->add('end_date', 'Half-day leave must have the same start and end date.');
            }
        });
    }
}
