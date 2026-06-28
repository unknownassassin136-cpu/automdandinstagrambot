import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AutomationsService } from '../../../core/services/automations.service';
import { AccountsService, ConnectedAccount } from '../../../core/services/accounts.service';

@Component({
  selector: 'app-automation-builder',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './builder.component.html',
})
export class BuilderComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private automationsService = inject(AutomationsService);
  private accountsService = inject(AccountsService);

  activeAccount: ConnectedAccount | null = null;
  mediaList: any[] = [];
  loading = false;
  error = '';
  isEditing = false;
  editingRuleId: string | null = null;

  builderForm = this.fb.group({
    name: ['', Validators.required],
    targetMediaId: ['', Validators.required],
    isDefaultRule: [false], // checkbox for default catch-all
    triggerType: ['comment_exact', Validators.required],
    keywords: [''],
    replyType: ['comment_and_dm', Validators.required],
    commentTemplate: ['', Validators.required],
    dmTemplate: [''],
    commentVariants: this.fb.array([this.fb.control('', Validators.required)]),
    dmVariants: this.fb.array([this.fb.control('')]),
  });

  get commentVariants() {
    return this.builderForm.get('commentVariants') as FormArray;
  }

  get dmVariants() {
    return this.builderForm.get('dmVariants') as FormArray;
  }

  addCommentVariant() {
    if (this.commentVariants.length < 4) {
      this.commentVariants.push(this.fb.control('', Validators.required));
    }
  }

  removeCommentVariant(index: number) {
    if (this.commentVariants.length > 1) {
      this.commentVariants.removeAt(index);
    }
  }

  addDmVariant() {
    if (this.dmVariants.length < 4) {
      this.dmVariants.push(this.fb.control(''));
    }
  }

  removeDmVariant(index: number) {
    if (this.dmVariants.length > 1) {
      this.dmVariants.removeAt(index);
    }
  }

  private route = inject(ActivatedRoute);

  constructor() {}

  ngOnInit() {
    this.accountsService.getAccounts().subscribe({
      next: (accounts) => {
        if (accounts.length > 0) {
          // Default to the first connected account for now
          this.activeAccount = accounts[0];
          this.fetchMedia(this.activeAccount.id);
          this.checkEditMode();
        }
      },
      error: (err) => console.error('Failed to fetch accounts', err)
    });

    // Read targetMediaId from query params if creating a new rule
    this.route.queryParams.subscribe(params => {
      if (params['targetMediaId']) {
        this.builderForm.patchValue({ targetMediaId: params['targetMediaId'] });
      } else if (!this.route.snapshot.paramMap.get('id')) {
        // If not editing and no targetMediaId, redirect back to automations list
        this.router.navigate(['/automations']);
      }
    });

    // Update validators based on form state
    this.builderForm.get('isDefaultRule')?.valueChanges.subscribe(() => this.updateValidators());
    this.builderForm.get('replyType')?.valueChanges.subscribe(() => this.updateValidators());
    // Initial validator setup
    this.updateValidators();
  }

  updateValidators() {
    const isDefault = this.builderForm.get('isDefaultRule')?.value;
    const replyType = this.builderForm.get('replyType')?.value;
    
    const keywordsControl = this.builderForm.get('keywords');
    const commentTemplateControl = this.builderForm.get('commentTemplate');
    const dmTemplateControl = this.builderForm.get('dmTemplate');

    // Keywords validation
    if (isDefault) {
      keywordsControl?.clearValidators();
    } else {
      keywordsControl?.setValidators([Validators.required]);
    }
    keywordsControl?.updateValueAndValidity();

    // Comment validation
    if (isDefault || replyType === 'dm_only') {
      commentTemplateControl?.clearValidators();
    } else {
      commentTemplateControl?.setValidators([Validators.required]);
    }
    commentTemplateControl?.updateValueAndValidity();

    // DM validation
    if (isDefault || replyType === 'comment_only') {
      dmTemplateControl?.clearValidators();
    } else {
      dmTemplateControl?.setValidators([Validators.required]); // Optional: if you want DM to be required when selected
    }
    dmTemplateControl?.updateValueAndValidity();
    
    // Note: FormArray elements are already validated when added, but we don't enforce global required
    // on the arrays themselves unless needed. Currently commentVariants has a required validator on its initial control.
  }

  fetchMedia(accountId: string) {
    console.log('Fetching media for account:', accountId);
    this.accountsService.getMedia(accountId).subscribe({
      next: (media) => {
        console.log('Successfully fetched media:', media.length, 'items');
        this.mediaList = media;
      },
      error: (err) => console.error('Failed to fetch media:', err)
    });
  }

  checkEditMode() {
    this.editingRuleId = this.route.snapshot.paramMap.get('id');
    if (this.editingRuleId && this.activeAccount) {
      this.isEditing = true;
      this.automationsService.getRules(this.activeAccount.id).subscribe(rules => {
        const ruleToEdit = rules.find(r => r.id === this.editingRuleId);
        if (ruleToEdit) {
          this.builderForm.patchValue({
            name: 'Rule ' + ruleToEdit.triggerKeyword, // Defaulting as we don't save names yet
            targetMediaId: (ruleToEdit as any).targetMediaId || '',
            isDefaultRule: (ruleToEdit as any).isDefaultRule || false,
            triggerType: (ruleToEdit as any).triggerType || 'comment_exact',
            keywords: ruleToEdit.triggerKeyword || '',
            replyType: ruleToEdit.dmTemplateText ? 'comment_and_dm' : 'comment_only',
            commentTemplate: ruleToEdit.replyCommentText || '',
            dmTemplate: ruleToEdit.dmTemplateText || ''
          });

          // Handle Variants Array Patching
          if ((ruleToEdit as any).replyCommentVariants && (ruleToEdit as any).replyCommentVariants.length > 0) {
            this.commentVariants.clear();
            (ruleToEdit as any).replyCommentVariants.forEach((variant: string) => {
              this.commentVariants.push(this.fb.control(variant, Validators.required));
            });
          }

          if ((ruleToEdit as any).dmTemplateVariants && (ruleToEdit as any).dmTemplateVariants.length > 0) {
            this.dmVariants.clear();
            (ruleToEdit as any).dmTemplateVariants.forEach((variant: string) => {
              this.dmVariants.push(this.fb.control(variant));
            });
          }
        }
      });
    }
  }

  onSubmit() {
    if (this.builderForm.valid && this.activeAccount) {
      this.loading = true;
      this.error = '';

      const formValue = this.builderForm.value;
      
      // 1. Create the Rule
      const keywords = (formValue.keywords || '').split(',').map((k: string) => k.trim());
      const triggerKeyword = keywords.length > 0 ? keywords[0] : '';

      const rulePayload = {
        accountId: this.activeAccount.id,
        triggerKeyword: triggerKeyword,
        targetMediaId: formValue.targetMediaId || null,
        isDefaultRule: !!formValue.isDefaultRule,
        replyCommentText: formValue.commentTemplate || '',
        dmTemplateText: formValue.dmTemplate || '',
        replyCommentVariants: !!formValue.isDefaultRule ? formValue.commentVariants : [],
        dmTemplateVariants: !!formValue.isDefaultRule ? formValue.dmVariants : [],
        isActive: true
      };

      if (this.isEditing && this.editingRuleId) {
        this.automationsService.updateRule(this.editingRuleId, rulePayload).subscribe({
          next: () => {
            this.loading = false;
            this.router.navigate(['/automations']);
          },
          error: (err) => {
            this.loading = false;
            this.error = 'Failed to update rule: ' + (err.error?.error || err.message);
          }
        });
      } else {
        this.automationsService.createRule(rulePayload).subscribe({
          next: () => {
            this.loading = false;
            this.router.navigate(['/automations']);
          },
          error: (err) => {
            this.loading = false;
            this.error = 'Failed to save rule: ' + (err.error?.error || err.message);
          }
        });
      }
    } else if (!this.activeAccount) {
      this.error = 'No connected Instagram account found. Please connect your account in Settings first.';
    }
  }
}
