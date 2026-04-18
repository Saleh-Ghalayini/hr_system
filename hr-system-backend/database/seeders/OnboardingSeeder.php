<?php

namespace Database\Seeders;

use App\Models\OnboardingDocument;
use App\Models\OnboardingChecklistItem;
use Illuminate\Database\Seeder;

class OnboardingSeeder extends Seeder
{
    public function run(): void
    {
        // Default document requirements
        $documents = [
            ['name' => 'National ID / Passport', 'icon' => 'mdi:card-account-details', 'status' => 'required', 'sort_order' => 1],
            ['name' => 'Educational Certificates', 'icon' => 'mdi:school', 'status' => 'required', 'sort_order' => 2],
            ['name' => 'Previous Employment Letters', 'icon' => 'mdi:briefcase', 'status' => 'optional', 'sort_order' => 3],
            ['name' => 'Signed Contract', 'icon' => 'mdi:file-sign', 'status' => 'required', 'sort_order' => 4],
            ['name' => 'Bank Account Details', 'icon' => 'mdi:bank', 'status' => 'required', 'sort_order' => 5],
            ['name' => 'CV / Resume', 'icon' => 'mdi:file-account', 'status' => 'required', 'sort_order' => 6],
            ['name' => 'Medical Clearance Certificate', 'icon' => 'mdi:medical-bag', 'status' => 'required', 'sort_order' => 7],
            ['name' => 'Emergency Contact Information', 'icon' => 'mdi:phone-alert', 'status' => 'required', 'sort_order' => 8],
            ['name' => 'Profile Photo', 'icon' => 'mdi:camera', 'status' => 'optional', 'sort_order' => 9],
            ['name' => 'Social Security / Tax Documents', 'icon' => 'mdi:file-document-outline', 'status' => 'required', 'sort_order' => 10],
        ];

        foreach ($documents as $doc) {
            OnboardingDocument::updateOrCreate(
                ['name' => $doc['name']],
                [
                    'icon' => $doc['icon'],
                    'status' => $doc['status'],
                    'sort_order' => $doc['sort_order'],
                    'is_active' => true,
                ]
            );
        }

        // Default checklist items
        $checklistItems = [
            // Day 1 tasks
            ['label' => 'Receive company badge and access cards', 'category' => 'Day 1', 'sort_order' => 1],
            ['label' => 'Set up workstation and equipment', 'category' => 'Day 1', 'sort_order' => 2],
            ['label' => 'Complete HR paperwork and contracts', 'category' => 'Day 1', 'sort_order' => 3],
            ['label' => 'Meet team members and direct manager', 'category' => 'Day 1', 'sort_order' => 4],
            ['label' => 'Receive employee handbook and review company policies', 'category' => 'Day 1', 'sort_order' => 5],
            
            // Week 1 tasks
            ['label' => 'Complete security and compliance training', 'category' => 'Week 1', 'sort_order' => 1],
            ['label' => 'Review company policies and handbook', 'category' => 'Week 1', 'sort_order' => 2],
            ['label' => 'Set up email and required software accounts', 'category' => 'Week 1', 'sort_order' => 3],
            ['label' => 'Schedule 1-on-1 with manager', 'category' => 'Week 1', 'sort_order' => 4],
            ['label' => 'Complete IT security awareness training', 'category' => 'Week 1', 'sort_order' => 5],
            ['label' => 'Review department goals and current projects', 'category' => 'Week 1', 'sort_order' => 6],
            
            // Month 1 tasks
            ['label' => 'Complete role-specific training', 'category' => 'Month 1', 'sort_order' => 1],
            ['label' => 'Submit first performance check-in', 'category' => 'Month 1', 'sort_order' => 2],
            ['label' => 'Confirm payroll and benefits enrollment', 'category' => 'Month 1', 'sort_order' => 3],
            ['label' => 'Complete 30-day review with manager', 'category' => 'Month 1', 'sort_order' => 4],
            ['label' => 'Set 90-day goals with manager', 'category' => 'Month 1', 'sort_order' => 5],
            ['label' => 'Complete all required compliance training', 'category' => 'Month 1', 'sort_order' => 6],
        ];

        foreach ($checklistItems as $item) {
            OnboardingChecklistItem::updateOrCreate(
                ['label' => $item['label']],
                [
                    'category' => $item['category'],
                    'sort_order' => $item['sort_order'],
                    'is_active' => true,
                ]
            );
        }
    }
}
