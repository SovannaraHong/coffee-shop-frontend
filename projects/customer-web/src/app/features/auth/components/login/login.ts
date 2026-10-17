import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { saveAuth } from '../../../../core/auth/auth/auth-storage.util';
import { saveRefreshToken } from '../../../../core/auth/auth/session.util';
import { CustomerLoginRequest } from '../../../../../../../../libs/models/customer/customer-request.model';
import { CustomerService } from '../../../../../../../../libs/api/customer/customer.service';

@Component({
  imports: [CommonModule, ReactiveFormsModule, RouterModule, RouterLink],
  selector: 'app-login',
  templateUrl: './login.html',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly authApi = inject(CustomerService);
  private readonly router = inject(Router);

  loginForm: FormGroup;

  readonly showPassword = signal(false);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      rememberMe: [false],
    });
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
