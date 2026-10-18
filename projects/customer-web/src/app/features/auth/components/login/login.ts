import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { saveAuth } from '../../../../core/auth/auth/auth-storage.util';
import { saveRefreshToken } from '../../../../core/auth/auth/session.util';
import { CustomerLoginRequest } from '../../../../../../../../libs/models/customer/customer-request.model';
import { CustomerService } from '../../../../../../../../libs/api/customer/customer.service';
import { LoginRateLimitService } from '../../../../core/services/login-rate-limit';

@Component({
  imports: [CommonModule, ReactiveFormsModule, RouterModule, RouterLink],
  selector: 'app-login',
  templateUrl: './login.html',
})
export class Login implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly authApi = inject(CustomerService);
  private readonly router = inject(Router);
  private readonly rateLimit = inject(LoginRateLimitService);

  loginForm: FormGroup;

  readonly showPassword = signal(false);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  readonly isBlocked = signal(false);
  readonly remainingSeconds = signal(0);

  private countdownTimer?: ReturnType<typeof setInterval>;
  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      rememberMe: [false],
    });
  }
  ngOnInit(): void {
    const result = this.rateLimit.checkRefresh();

    if (result.blocked) {
      this.startCountdown();
    }
  }

  ngOnDestroy(): void {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = undefined;
    }
  }
  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
  private startCountdown(): void {
    this.isBlocked.set(true);

    this.remainingSeconds.set(this.rateLimit.getRemainingSeconds());

    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }

    this.countdownTimer = setInterval(() => {
      const remaining = this.rateLimit.getRemainingSeconds();

      this.remainingSeconds.set(remaining);

      if (remaining <= 0) {
        this.isBlocked.set(false);
        this.errorMessage.set('');

        if (this.countdownTimer) {
          clearInterval(this.countdownTimer);
          this.countdownTimer = undefined;
        }
      }
    }, 1000);
  }
  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set('');

    const request: CustomerLoginRequest = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
    };

    this.authApi.login(request).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        saveAuth({
          token: res.token,
          tokenType: res.tokenType,
          customer: res.customer,
        });
        saveRefreshToken(res.refreshToken);
        this.router.navigate(['/']);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Invalid email or password. Please try again.');
      },
    });
  }

  goToRegister() {
    this.router.navigate(['front/signup']);
  }
}
