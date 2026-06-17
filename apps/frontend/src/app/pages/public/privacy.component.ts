import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-100">
        <h1 class="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
        
        <div class="prose prose-blue max-w-none text-gray-600">
          <p class="mb-4">Last updated: {{ currentDate | date }}</p>

          <h2 class="text-xl font-semibold text-gray-800 mt-6 mb-3">1. Information We Collect</h2>
          <p class="mb-4">
            When you connect your Instagram account to our service, we collect basic profile information
            (such as your username and Instagram Business ID) and request permissions to read and reply to
            comments and direct messages on your behalf.
          </p>

          <h2 class="text-xl font-semibold text-gray-800 mt-6 mb-3">2. How We Use Your Information</h2>
          <p class="mb-4">
            The data we collect is strictly used to provide the automation services you request. We listen
            for webhooks from Meta when someone comments on your posts or sends you a direct message. Our system
            then processes these events to send automated replies according to the rules you configure.
          </p>

          <h2 class="text-xl font-semibold text-gray-800 mt-6 mb-3">3. Data Sharing</h2>
          <p class="mb-4">
            We do not sell, rent, or share your personal data or your customers' data with third parties.
            Your Instagram access tokens are securely encrypted in our database.
          </p>

          <h2 class="text-xl font-semibold text-gray-800 mt-6 mb-3">4. Security</h2>
          <p class="mb-4">
            We implement industry-standard security measures to protect your data. All communication with
            Meta's APIs occurs over encrypted HTTPS connections.
          </p>

          <h2 class="text-xl font-semibold text-gray-800 mt-6 mb-3">5. Contact Us</h2>
          <p class="mb-4">
            If you have any questions about this Privacy Policy, please contact us at support&#64;automd.com.
          </p>
        </div>
      </div>
    </div>
  `
})
export class PrivacyComponent {
  currentDate = new Date();
}
