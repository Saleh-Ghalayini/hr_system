<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\OnboardingDocument;
use App\Models\OnboardingChecklistItem;
use App\Models\UserOnboardingDocument;
use App\Models\UserOnboardingChecklist;
use App\Models\UserOnboardingStatus;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class OnboardingController extends Controller
{
    use ApiResponse;

    // ─────────────────────────────────────────────────────────────
    // ADMIN: Document Template Management
    // ─────────────────────────────────────────────────────────────

    public function getDocumentTemplates()
    {
        $documents = OnboardingDocument::where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        return $this->success($documents);
    }

    public function createDocumentTemplate(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'icon' => 'nullable|string|max:50',
            'status' => 'required|in:required,optional',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $document = OnboardingDocument::create([
            'name' => $data['name'],
            'icon' => $data['icon'] ?? 'mdi:file-document',
            'status' => $data['status'],
            'sort_order' => $data['sort_order'] ?? 0,
            'is_active' => true,
        ]);

        return $this->created($document, 'Document template created.');
    }

    public function updateDocumentTemplate(Request $request, $id)
    {
        $document = OnboardingDocument::find($id);
        if (!$document) return $this->notFound('Document not found.');

        $data = $request->validate([
            'name' => 'sometimes|string|max:100',
            'icon' => 'nullable|string|max:50',
            'status' => 'sometimes|in:required,optional',
            'sort_order' => 'nullable|integer|min:0',
            'is_active' => 'sometimes|boolean',
        ]);

        $document->update($data);
        return $this->success($document, 'Document template updated.');
    }

    public function deleteDocumentTemplate($id)
    {
        $document = OnboardingDocument::find($id);
        if (!$document) return $this->notFound('Document not found.');

        $document->update(['is_active' => false]);
        return $this->success(null, 'Document template deactivated.');
    }

    // ─────────────────────────────────────────────────────────────
    // ADMIN: Checklist Template Management
    // ─────────────────────────────────────────────────────────────

    public function getChecklistTemplates()
    {
        $items = OnboardingChecklistItem::where('is_active', true)
            ->orderBy('category')
            ->orderBy('sort_order')
            ->get();

        return $this->success($items);
    }

    public function createChecklistTemplate(Request $request)
    {
        $data = $request->validate([
            'label' => 'required|string|max:255',
            'category' => 'required|string|max:50',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $item = OnboardingChecklistItem::create([
            'label' => $data['label'],
            'category' => $data['category'],
            'sort_order' => $data['sort_order'] ?? 0,
            'is_active' => true,
        ]);

        return $this->created($item, 'Checklist item created.');
    }

    public function updateChecklistTemplate(Request $request, $id)
    {
        $item = OnboardingChecklistItem::find($id);
        if (!$item) return $this->notFound('Checklist item not found.');

        $data = $request->validate([
            'label' => 'sometimes|string|max:255',
            'category' => 'sometimes|string|max:50',
            'sort_order' => 'nullable|integer|min:0',
            'is_active' => 'sometimes|boolean',
        ]);

        $item->update($data);
        return $this->success($item, 'Checklist item updated.');
    }

    public function deleteChecklistTemplate($id)
    {
        $item = OnboardingChecklistItem::find($id);
        if (!$item) return $this->notFound('Checklist item not found.');

        $item->update(['is_active' => false]);
        return $this->success(null, 'Checklist item deactivated.');
    }

    // ─────────────────────────────────────────────────────────────
    // ADMIN: View All Users' Onboarding Progress
    // ─────────────────────────────────────────────────────────────

    public function getAllUsersProgress()
    {
        $users = User::with([
            'onboardingStatus',
            'onboardingDocuments.document',
            'onboardingChecklistProgress.checklistItem',
        ])
        ->where('role', '!=', 'admin')
        ->orderByDesc('created_at')
        ->get()
        ->map(function ($user) {
            $totalDocs = $user->onboardingDocuments->count();
            $uploadedDocs = $user->onboardingDocuments->whereIn('status', ['uploaded', 'approved'])->count();
            $requiredDocs = OnboardingDocument::where('is_active', true)->where('status', 'required')->count();

            $totalTasks = $user->onboardingChecklistProgress->count();
            $completedTasks = $user->onboardingChecklistProgress->where('is_completed', true)->count();
            $totalTemplateTasks = OnboardingChecklistItem::where('is_active', true)->count();

            $docItems = $user->onboardingDocuments->map(function ($d) {
                return [
                    'name' => $d->document->name ?? 'Unknown',
                    'status' => $d->status,
                    'file_path' => $d->file_path,
                ];
            });

            $checklistItems = $user->onboardingChecklistProgress->map(function ($c) {
                return [
                    'label' => $c->checklistItem->label ?? 'Unknown',
                    'category' => $c->checklistItem->category ?? '',
                    'is_completed' => $c->is_completed,
                    'completed_at' => $c->completed_at,
                ];
            });

            return [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->first_name . ' ' . $user->last_name,
                    'email' => $user->email,
                    'position' => $user->position,
                    'created_at' => $user->created_at,
                ],
                'documents' => [
                    'total' => $totalDocs,
                    'uploaded' => $uploadedDocs,
                    'required' => $requiredDocs,
                    'items' => $docItems,
                ],
                'checklist' => [
                    'total' => $totalTemplateTasks,
                    'completed' => $completedTasks,
                    'items' => $checklistItems,
                ],
                'status' => $user->onboardingStatus ? [
                    'is_complete' => $user->onboardingStatus->is_onboarding_complete,
                    'started_at' => $user->onboardingStatus->onboarding_started_at,
                    'completed_at' => $user->onboardingStatus->onboarding_completed_at,
                ] : null,
            ];
        });

        return $this->success($users);
    }

    public function getUserProgress($userId)
    {
        $user = User::with([
            'onboardingStatus',
            'onboardingDocuments.document',
            'onboardingChecklistProgress.checklistItem',
        ])->find($userId);

        if (!$user) return $this->notFound('User not found.');

        return $this->success([
            'user' => [
                'id' => $user->id,
                'name' => $user->first_name . ' ' . $user->last_name,
                'email' => $user->email,
                'position' => $user->position,
            ],
            'documents' => $user->onboardingDocuments,
            'checklist' => $user->onboardingChecklistProgress,
            'status' => $user->onboardingStatus,
        ]);
    }

    public function approveDocument(Request $request, $userId, $documentId)
    {
        $userDoc = UserOnboardingDocument::where('user_id', $userId)
            ->where('document_id', $documentId)
            ->first();

        if (!$userDoc) return $this->notFound('User document not found.');

        $data = $request->validate([
            'status' => 'required|in:approved,rejected',
            'admin_notes' => 'nullable|string|max:500',
        ]);

        $userDoc->update([
            'status' => $data['status'],
            'admin_notes' => $data['admin_notes'] ?? null,
        ]);

        return $this->success($userDoc, 'Document status updated.');
    }

    public function approveChecklistItem($userId, $itemId)
    {
        $progress = UserOnboardingChecklist::where('user_id', $userId)
            ->where('checklist_item_id', $itemId)
            ->first();

        if (!$progress) return $this->notFound('Checklist progress not found.');

        $progress->update([
            'is_completed' => true,
            'completed_at' => now(),
        ]);

        return $this->success($progress, 'Checklist item approved.');
    }

    public function markOnboardingComplete($userId)
    {
        $user = User::find($userId);
        if (!$user) return $this->notFound('User not found.');

        $status = UserOnboardingStatus::updateOrCreate(
            ['user_id' => $userId],
            [
                'is_onboarding_complete' => true,
                'onboarding_completed_at' => now(),
            ]
        );

        return $this->success($status, 'Onboarding marked as complete.');
    }

    // ─────────────────────────────────────────────────────────────
    // USER: My Onboarding (Employee views own progress)
    // ─────────────────────────────────────────────────────────────

    public function getMyOnboardingProgress(Request $request)
    {
        $userId = $request->user()->id;
        $user = User::with([
            'onboardingStatus',
            'onboardingDocuments.document',
            'onboardingChecklistProgress.checklistItem',
        ])->find($userId);

        if (!$user) return $this->notFound('User not found.');

        $templateDocs = OnboardingDocument::where('is_active', true)->orderBy('sort_order')->get();
        $templateItems = OnboardingChecklistItem::where('is_active', true)
            ->orderBy('category')
            ->orderBy('sort_order')
            ->get();

        $userDocMap = $user->onboardingDocuments->keyBy('document_id');
        $userCheckMap = $user->onboardingChecklistProgress->keyBy('checklist_item_id');

        $documents = $templateDocs->map(function ($doc) use ($userDocMap) {
            $userDoc = $userDocMap->get($doc->id);
            return [
                'id' => $doc->id,
                'name' => $doc->name,
                'icon' => $doc->icon,
                'status' => $doc->status,
                'user_status' => $userDoc ? $userDoc->status : 'pending',
                'file_path' => $userDoc?->file_path,
                'uploaded_at' => $userDoc?->created_at,
            ];
        });

        $checklist = $templateItems->map(function ($item) use ($userCheckMap) {
            $userProgress = $userCheckMap->get($item->id);
            return [
                'id' => $item->id,
                'label' => $item->label,
                'category' => $item->category,
                'is_completed' => $userProgress ? $userProgress->is_completed : false,
                'completed_at' => $userProgress?->completed_at,
            ];
        });

        $totalTasks = $templateItems->count();
        $completedTasks = $checklist->where('is_completed', true)->count();
        $requiredDocs = $templateDocs->where('status', 'required')->count();
        $uploadedDocs = $documents->where('user_status', '!=', 'pending')->count();

        return $this->success([
            'documents' => $documents,
            'checklist' => $checklist,
            'progress' => [
                'documents_uploaded' => $uploadedDocs,
                'documents_required' => $requiredDocs,
                'checklist_completed' => $completedTasks,
                'checklist_total' => $totalTasks,
                'overall_percent' => $totalTasks > 0
                    ? round((($completedTasks / $totalTasks) * 50) + (($uploadedDocs / max($requiredDocs, 1)) * 50), 0)
                    : 0,
            ],
            'onboarding_status' => $user->onboardingStatus,
        ]);
    }

    public function uploadDocument(Request $request)
    {
        $data = $request->validate([
            'document_id' => 'required|exists:onboarding_documents,id',
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:5120',
        ]);

        $userId = $request->user()->id;

        // Check if document already uploaded
        $existing = UserOnboardingDocument::where('user_id', $userId)
            ->where('document_id', $data['document_id'])
            ->first();

        $file = $request->file('file');
        $path = $file->store("onboarding/{$userId}", 'public');

        if ($existing) {
            // Delete old file if exists
            if ($existing->file_path) {
                Storage::disk('public')->delete($existing->file_path);
            }
            $existing->update([
                'file_path' => $path,
                'original_name' => $file->getClientOriginalName(),
                'status' => 'uploaded',
            ]);
            $userDoc = $existing;
        } else {
            $userDoc = UserOnboardingDocument::create([
                'user_id' => $userId,
                'document_id' => $data['document_id'],
                'file_path' => $path,
                'original_name' => $file->getClientOriginalName(),
                'status' => 'uploaded',
            ]);

            // Create onboarding status record if doesn't exist
            UserOnboardingStatus::firstOrCreate(
                ['user_id' => $userId],
                ['onboarding_started_at' => now()]
            );
        }

        return $this->success($userDoc, 'Document uploaded successfully.');
    }

    public function toggleChecklistItem(Request $request)
    {
        $data = $request->validate([
            'checklist_item_id' => 'required|exists:onboarding_checklist_items,id',
        ]);

        $userId = $request->user()->id;

        $progress = UserOnboardingChecklist::updateOrCreate(
            [
                'user_id' => $userId,
                'checklist_item_id' => $data['checklist_item_id'],
            ],
            [
                'is_completed' => true,
                'completed_at' => now(),
            ]
        );

        // Create onboarding status record if doesn't exist
        UserOnboardingStatus::firstOrCreate(
            ['user_id' => $userId],
            ['onboarding_started_at' => now()]
        );

        return $this->success($progress, 'Checklist item updated.');
    }

    public function untoggleChecklistItem(Request $request)
    {
        $data = $request->validate([
            'checklist_item_id' => 'required|exists:onboarding_checklist_items,id',
        ]);

        $userId = $request->user()->id;

        $progress = UserOnboardingChecklist::where('user_id', $userId)
            ->where('checklist_item_id', $data['checklist_item_id'])
            ->first();

        if ($progress) {
            $progress->update(['is_completed' => false, 'completed_at' => null]);
        }

        return $this->success(null, 'Checklist item unchecked.');
    }
}