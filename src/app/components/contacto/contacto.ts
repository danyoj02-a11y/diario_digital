import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

interface UsuarioSesion {
    nombre?: string;
    fullName?: string;
    email?: string;
    correo?: string;
}

@Component({
    selector: 'app-contacto',
    imports: [ReactiveFormsModule],
    templateUrl: './contacto.html'
})
export class ContactoComponent implements OnInit {
    private readonly fb = inject(FormBuilder);
    readonly sent = signal('');

    readonly form = this.fb.nonNullable.group({
        fullName: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        subject: ['', Validators.required],
        message: ['', [Validators.required, Validators.minLength(10)]]
    });

    ngOnInit(): void {
        this.precargarDatosUsuario();
    }

    private precargarDatosUsuario(): void {
  try {
    const rawUser = localStorage.getItem('diario_user');
    if (rawUser) {
      const user = JSON.parse(rawUser);
      // Busca la propiedad de nombre bajo cualquier clave común (name, nombre, fullName, etc.)
      const nombre = user.name || user.nombre || user.fullName || user.usuario || '';
      const correo = user.email || user.correo || '';

      this.form.patchValue({
        fullName: nombre,
        email: correo
      });
    }
  } catch {
    // Si ocurre un error de lectura/parseo, se ignora limpiamente
  }
}

    submit(event: Event) {
        event.preventDefault();
        const formElement = event.target as HTMLFormElement;

        // Dispara el mensaje flotante nativo HTML5 si falta algún campo obligatorio
        if (!formElement.checkValidity() || this.form.invalid) {
            formElement.reportValidity();
            return;
        }

        const msgs = JSON.parse(localStorage.getItem('diario_digital_contacts') ?? '[]') as unknown[];
        msgs.unshift({
            ...this.form.getRawValue(),
            id: crypto.randomUUID(),
            submittedAt: new Date().toISOString()
        });

        localStorage.setItem('diario_digital_contacts', JSON.stringify(msgs));
        this.form.reset();

        // Si la sesión sigue activa, volvemos a precargar el nombre y correo tras limpiar el mensaje
        this.precargarDatosUsuario();
        this.sent.set('Tu mensaje se guardó correctamente. Gracias por contactarnos.');
    }
}