import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
interface AccountUser { name: string; email: string; passwordHash: string }
interface ActiveUser { name: string; email: string }
@Component({ selector: 'app-cuenta', imports: [FormsModule, RouterLink], templateUrl: './cuenta.html' })
export class CuentaComponent {
    private readonly route = inject(ActivatedRoute); private readonly router = inject(Router);
    readonly activeUser = signal<ActiveUser | null>(this.readActiveUser()); readonly mode = signal<'register' | 'login'>('register'); readonly notice = signal('');
    registerName = ''; registerEmail = ''; registerPassword = ''; loginEmail = ''; loginPassword = '';
    selectMode(mode: 'register' | 'login') { this.mode.set(mode); this.notice.set(''); }
    async register() {
        const name = this.registerName.trim(), email = this.registerEmail.trim().toLowerCase();
        if (name.length < 3 || !this.validEmail(email) || this.registerPassword.length < 8) { this.notice.set('Completa los datos requeridos. La contraseña debe tener al menos 8 caracteres.'); return; }
        const users = this.readUsers(); if (users.some(user => user.email === email)) { this.notice.set('Ya existe una cuenta registrada con ese correo.'); return; }
        try { const passwordHash = await this.hash(this.registerPassword); users.push({ name, email, passwordHash }); localStorage.setItem('diario_digital_users', JSON.stringify(users)); this.registerName = this.registerPassword = ''; this.loginEmail = email; this.selectMode('login'); this.notice.set('Cuenta creada correctamente. Ya puedes iniciar sesión.'); } catch { this.notice.set('No fue posible crear la cuenta en este navegador. Inténtalo de nuevo.'); }
    }
    async login() {
        const email = this.loginEmail.trim().toLowerCase(); if (!this.validEmail(email) || !this.loginPassword) { this.notice.set('Escribe un correo y una contraseña válidos.'); return; }
        try { const passwordHash = await this.hash(this.loginPassword); const user = this.readUsers().find(item => item.email === email && item.passwordHash === passwordHash); if (!user) { this.notice.set('El correo o la contraseña no son correctos.'); return; } this.startSession(user); this.loginPassword = ''; this.notice.set('Sesión iniciada correctamente.'); const next = this.route.snapshot.queryParamMap.get('next'); if (next?.startsWith('/')) void this.router.navigateByUrl(next); } catch { this.notice.set('No fue posible validar la cuenta en este navegador. Inténtalo de nuevo.'); }
    }
    logout() { localStorage.removeItem('diario_user'); localStorage.removeItem('diario_digital_session'); this.activeUser.set(null); this.notice.set('Has cerrado sesión.'); window.dispatchEvent(new Event('authchange')); }
    private startSession(user: AccountUser) { const active = { name: user.name, email: user.email }; localStorage.setItem('diario_user', JSON.stringify(active)); localStorage.setItem('diario_digital_session', JSON.stringify({ email: user.email })); this.activeUser.set(active); window.dispatchEvent(new Event('authchange')); }
    private readUsers(): AccountUser[] { try { return JSON.parse(localStorage.getItem('diario_digital_users') ?? '[]') as AccountUser[] } catch { return []; } }
    private readActiveUser(): ActiveUser | null { try { const raw = localStorage.getItem('diario_user'); if (raw) { const parsed = JSON.parse(raw) as ActiveUser; if (parsed.email) return parsed; } const session = JSON.parse(localStorage.getItem('diario_digital_session') ?? 'null') as { email?: string } | null; const legacy = this.readUsers().find(user => user.email === session?.email); if (legacy) { const active = { name: legacy.name, email: legacy.email }; localStorage.setItem('diario_user', JSON.stringify(active)); return active; } return null; } catch { return null; } }
    private validEmail(value: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }
    private async hash(value: string) { const bytes = new TextEncoder().encode(value); const digest = await crypto.subtle.digest('SHA-256', bytes); return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join(''); }
}

