import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Logo } from '../../../shared/components/logo/logo';
import { AuthService } from '../auth-service';
import { apiErrorMessage } from '../../utils/api-error';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, Logo],
  templateUrl: './login.html',
})
export class Login {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);

  protected readonly mode = signal<'login' | 'otp' | 'forgot'>('login');
  protected readonly showPassword = signal(false);
  protected readonly capsLock = signal(false);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly resetSentTo = signal<string | null>(null);

  protected readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    remember: [true],
  });

  protected readonly code = this.fb.control('', [
    Validators.required,
    Validators.pattern(/^\d{6}$/),
  ]);
  protected readonly resetEmail = this.fb.control('', [Validators.required, Validators.email]);

  /** Only allow same-site paths so ?returnUrl can't redirect to another website */
  private readonly returnUrl = (() => {
    const url = this.route.snapshot.queryParamMap.get('returnUrl');
    return url && url.startsWith('/') && !url.startsWith('//') ? url : '/dashboard';
  })();

  constructor() {
    if (this.auth.isAuthenticated()) this.router.navigateByUrl(this.returnUrl);
  }

  /** Step 1: email + password. */
  protected submit(): void {
    if (this.loading()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.send();
  }

  /** Step 2: the 6-digit authenticator code. */
  protected submitCode(): void {
    if (this.loading()) return;
    if (this.code.invalid) {
      this.code.markAsTouched();
      return;
    }
    this.send(this.code.value);
  }

  private send(otp?: string): void {
    const { email, password, remember } = this.form.getRawValue();
    this.loading.set(true);
    this.error.set(null);

    this.auth.login(email.trim(), password, remember, otp).subscribe({
      next: (res) => {
        // The account has an authenticator: show the code screen
        if (res.otpRequired) {
          this.loading.set(false);
          this.code.reset('');
          this.mode.set('otp');
          return;
        }

        // Answered OK but no token: don't spin forever
        if (!res.accessToken) {
          this.loading.set(false);
          this.error.set('Sign-in response was incomplete. Please try again.');
          return;
        }

        this.router.navigateByUrl(this.returnUrl).then((ok) => {
          if (!ok) {
            this.loading.set(false);
            this.error.set('Signed in, but the page could not be opened.');
          }
        });
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(apiErrorMessage(err, 'We couldn’t sign you in. Please try again.'));
        if (otp) this.code.reset('');
        else this.form.controls.password.reset('');
      },
    });
  }

  /** Keep digits only, and submit automatically at 6 digits. */
  protected onCodeInput(e: Event): void {
    const input = e.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, 6);
    input.value = digits;
    this.code.setValue(digits);
    if (digits.length === 6) this.submitCode();
  }

  protected backToLogin(): void {
    this.error.set(null);
    this.code.reset('');
    this.form.controls.password.reset('');
    this.mode.set('login');
  }

  protected openForgot(): void {
    this.error.set(null);
    this.resetSentTo.set(null);
    this.resetEmail.setValue(this.form.controls.email.value);
    this.resetEmail.markAsUntouched();
    this.mode.set('forgot');
  }

  protected sendReset(): void {
    if (this.loading()) return;
    if (this.resetEmail.invalid) {
      this.resetEmail.markAsTouched();
      return;
    }
    const email = this.resetEmail.value.trim();
    this.loading.set(true);
    this.error.set(null);

    this.auth.forgotPassword(email).subscribe({
      next: () => {
        this.loading.set(false);
        this.resetSentTo.set(email);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(apiErrorMessage(err));
      },
    });
  }

  protected onKey(e: KeyboardEvent): void {
    this.capsLock.set(e.getModifierState?.('CapsLock') ?? false);
  }
}
