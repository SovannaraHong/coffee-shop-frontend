import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';

import { CustomerApiService } from '../../../../../../../../libs/api/customer/customer-api.service';
import { CustomerRegisterRequest } from '../../../../../../../../libs/api/customer/customer-api.model';

function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (!password || !confirmPassword) {
    return null;
  }

  return password === confirmPassword ? null : { passwordsMismatch: true };
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './signup.html',
})
export class Signup {
  private readonly fb = inject(FormBuilder);
  private readonly authApi = inject(CustomerApiService);
  private readonly router = inject(Router);

  readonly showPassword = signal(false);
  readonly showConfirmPassword = signal(false);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  readonly signupForm = this.fb.nonNullable.group(
    {
      firstName: ['', [Validators.required, Validators.minLength(2)]],

      lastName: ['', [Validators.required, Validators.minLength(2)]],

      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],

      email: ['', [Validators.required, Validators.email]],

      password: ['', [Validators.required, Validators.minLength(6)]],

      confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
    },
    {
      validators: passwordsMatchValidator,
    },
  );

  get firstName() {
    return this.signupForm.controls.firstName;
  }

  get lastName() {
    return this.signupForm.controls.lastName;
  }

  get email() {
    return this.signupForm.controls.email;
  }

  get phone() {
    return this.signupForm.controls.phone;
  }

  get password() {
    return this.signupForm.controls.password;
  }

  get confirmPassword() {
    return this.signupForm.controls.confirmPassword;
  }

  togglePassword(): void {
    this.showPassword.update((value) => !value);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update((value) => !value);
  }

  onSubmit(): void {
    if (this.isLoading()) {
      return;
    }

    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.errorMessage.set('');
    this.isLoading.set(true);

    const { firstName, lastName, phone, email, password } = this.signupForm.getRawValue();

    const request: CustomerRegisterRequest = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      password,
    };

    this.authApi
      .register(request)
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        }),
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/verify-otp'], {
            queryParams: { email: request.email },
          });
        },

        error: (err: HttpErrorResponse) => {
          this.handleRegisterError(err);
        },
      });
  }

  private handleRegisterError(err: HttpErrorResponse): void {
    if (err.status === 400) {
      this.errorMessage.set(err.error?.message ?? 'Please check your information and try again.');
      return;
    }

    if (err.status === 409) {
      this.errorMessage.set('An account with this email already exists.');
      return;
    }

    if (err.status === 0) {
      this.errorMessage.set('Unable to connect to the server. Please check your connection.');
      return;
    }

    this.errorMessage.set(err.error?.message ?? 'Could not create your account. Please try again.');
  }
}
