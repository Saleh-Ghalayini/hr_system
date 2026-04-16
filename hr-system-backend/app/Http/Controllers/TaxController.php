<?php

namespace App\Http\Controllers;

use App\Models\Tax;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class TaxController extends Controller
{
    use ApiResponse;

    public function index()
    {
        return $this->success(Tax::all());
    }

    public function update(Request $request, Tax $tax)
    {
        $data = $request->validate([
            'rate'  => 'required|numeric|min:0|max:100',
            'label' => 'sometimes|string|max:255',
        ]);

        $tax->update($data);

        return $this->success($tax, 'Tax rate updated successfully.');
    }
}
