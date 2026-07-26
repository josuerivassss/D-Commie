## 1. Quiénes Somos

Esta Política de Privacidad describe cómo el bot de Discord Commie y su Dashboard web complementario ("el Servicio") recolectan, usan y almacenan información.

## 2. Información que Recolectamos

**A través de Discord (cuando usas comandos del bot):**
- Tu ID de usuario de Discord, nombre de usuario, y el contenido de los comandos que envías al Bot.
- IDs de servidor (guild) y configuración que tú o los administradores de tu servidor establezcan (prefijo, idioma, mensajes de bienvenida/despedida, configuración de starboard, autoroles, configuración de tickets, recordatorios, tags, giveaways).

**A través del Dashboard (cuando inicias sesión con Discord):**
- Tu ID de usuario de Discord, nombre de usuario, avatar y discriminador, proporcionados por la API OAuth2 de Discord.
- La lista de servidores que administras (usada únicamente para determinar cuáles puedes configurar — no almacenamos esta lista más allá de tu sesión activa).
- Un token de acceso de Discord de corta duración, embebido en tu propio token de sesión, usado para reverificar tus permisos de servidor en cada solicitud.

**No recolectamos:**
- Tu contraseña de Discord (la autenticación ocurre completamente mediante el flujo OAuth2 propio de Discord).
- Contenido de mensajes de canales que no se le haya pedido explícitamente al Bot leer o sobre los que actuar.

## 3. Cómo Usamos la Información

Usamos la información anterior únicamente para operar el Servicio: ejecutar comandos del bot, persistir la configuración por servidor, autenticar sesiones del Dashboard, y hacer cumplir qué usuarios pueden configurar qué servidores.

## 4. Dónde se Almacenan los Datos

Los datos de configuración se almacenan en MongoDB (configuración de servidores, tags) y PostgreSQL (recordatorios, giveaways, zonas horarias, registros de auditoría), alojados por proveedores de bases de datos externos. Tu token de sesión del Dashboard se almacena en el almacenamiento local de tu navegador, no en una cookie, y nunca se transmite a ninguna parte distinta de la API propia de este Servicio.

## 5. Terceros

Compartimos datos con:
- **Discord Inc.**, según sea necesario para operar el Bot y el Dashboard (consulta la propia Política de Privacidad de Discord para saber cómo maneja Discord tus datos).
- Nuestros proveedores de bases de datos y hosting, únicamente como infraestructura para almacenar los datos descritos arriba — no los usan para sus propios fines.

No vendemos tus datos a anunciantes u otros terceros.

## 6. Retención de Datos

La configuración del servidor persiste mientras el Bot permanezca en ese servidor, o hasta que un administrador la modifique. Algunos datos (como recordatorios pendientes vinculados a un canal o servidor eliminado) se limpian automáticamente. Para solicitar la eliminación de datos asociados a tu cuenta o servidor, contáctanos a través de nuestro servidor de soporte.

## 7. Privacidad de Menores

El Servicio no está dirigido a menores de 13 años (o la edad mínima requerida por los propios Términos de Servicio de Discord en tu región). No recolectamos conscientemente información de usuarios por debajo de esta edad.

## 8. Tus Derechos

Dependiendo de tu jurisdicción, puedes tener derechos para acceder, corregir o solicitar la eliminación de tus datos. Contáctanos a través de nuestro servidor de soporte para hacer dicha solicitud.

## 9. Cambios a esta Política

Podemos actualizar esta Política de Privacidad periódicamente. La fecha de "Última actualización" en la parte superior de esta página refleja la revisión más reciente.

## 10. Contacto

Preguntas sobre esta Política de Privacidad pueden dirigirse a nuestro servidor de soporte (enlazado en el pie de página de este sitio).

---
