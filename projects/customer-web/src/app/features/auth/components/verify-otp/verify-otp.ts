import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomerApiService } from '../../../../../../../../libs/api/customer/customer-api.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { VerifyOtpRequest } from '../../../../../../../../libs/api/otp/otp-api-model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  imports: [ReactiveFormsModule, RouterModule],
  selector: 'app-verify-otp',
  templateUrl: './verify-otp.html',
})
export class VerifyOtp {
  private readonly fb = inject(FormBuilder);
  private readonly authApi = inject(CustomerApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly isLoading = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly email = signal(this.route.snapshot.queryParamMap.get('email') ?? '');

  otpForm: FormGroup = this.fb.group({
    code: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]],
  });
  get code() {
    return this.otpForm.get('code');
  }

  onSubmit(): void {
    if (this.otpForm.invalid || !this.email()) {
      this.otpForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const request: VerifyOtpRequest = {
      email: this.email(),
      code: this.otpForm.value.code,
    };

    this.authApi.verifyOtp(request).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.successMessage.set(res.message || 'Account verified.');
        setTimeout(() => this.router.navigate(['/login']), 1200);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Invalid or expired code. Please try again.');
      },
    });
  }
}
