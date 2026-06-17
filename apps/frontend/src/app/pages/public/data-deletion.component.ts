import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-data-deletion',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-100">
        <h1 class="text-3xl font-bold text-gray-900 mb-6">Data Deletion Instructions</h1>
        
        <div class="prose prose-blue max-w-none text-gray-600">
          <p class="mb-4">
            If you wish to remove your Instagram account from our service and delete all associated data,
            you have two options.
          </p>

          <h2 class="text-xl font-semibold text-gray-800 mt-6 mb-3">Option 1: Delete via our Dashboard</h2>
          <ol class="list-decimal pl-5 mb-4 space-y-2">
            <li>Log in to your account on our platform.</li>
            <li>Navigate to the <strong>Settings</strong> page.</li>
            <li>Under your connected accounts, click <strong>Disconnect Account</strong>.</li>
            <li>This will instantly revoke our access and permanently delete all your automation rules, logs, and encrypted access tokens from our database.</li>
          </ol>

          <h2 class="text-xl font-semibold text-gray-800 mt-6 mb-3">Option 2: Remove Access via Facebook</h2>
          <p class="mb-4">You can also remove our app's access directly from your Facebook/Instagram settings:</p>
          <ol class="list-decimal pl-5 mb-4 space-y-2">
            <li>Go to your Facebook account settings and navigate to <strong>Settings & Privacy > Settings > Business Integrations</strong>.</li>
            <li>Find our app in the list of active integrations.</li>
            <li>Click <strong>Remove</strong>.</li>
            <li>Once removed, we will automatically delete your data from our servers within 24 hours of receiving the webhook notification from Meta.</li>
          </ol>

          <h2 class="text-xl font-semibold text-gray-800 mt-6 mb-3">Questions?</h2>
          <p class="mb-4">
            If you need further assistance with data deletion, please contact us at support&#64;automd.com.
          </p>
        </div>
      </div>
    </div>
  `
})
export class DataDeletionComponent {
}
