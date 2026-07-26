## 1. Quiénes Somos

Esta Política de Privacidad describe cómo Commie ("el Servicio") y su dashboard web complementario ("el Servicio Web") recolectan, usan y almacenan información.

## 2. Información que Recolectamos

**A través del Servicio (cuando tú u otros usan sus comandos y funciones):**
- Tu ID de usuario de Discord, nombre de usuario, y el contenido de los comandos que envías al Servicio.
- IDs de servidor (guild) y configuración establecida por los administradores del servidor (prefijo, idioma, mensajes de bienvenida/despedida, configuración de starboard, autoroles, configuración de tickets, recordatorios, tags, giveaways).
- Contenido de mensajes, pero solo para funciones específicas que requieren inherentemente leer un mensaje para funcionar — por ejemplo, reproducir un mensaje en el starboard una vez que recibe suficientes reacciones, o incluir el texto de mensajes en la transcripción de cierre de un ticket de soporte. Ver la Sección 3 para más detalles.

**A través del Servicio Web (cuando inicias sesión con Discord):**
- Tu ID de usuario de Discord, nombre de usuario, avatar y discriminador, proporcionados por la API OAuth2 de Discord.
- La lista de servidores que administras (usada únicamente para determinar cuáles puedes configurar — no almacenamos esta lista más allá de tu sesión activa).
- Un token de acceso de Discord de corta duración, embebido en tu propio token de sesión, usado para reverificar tus permisos de servidor en cada solicitud.

**No recolectamos:**
- Tu contraseña de Discord (la autenticación ocurre completamente mediante el flujo OAuth2 propio de Discord).
- Contenido de mensajes de canales o mensajes sobre los que el Servicio no tenga ninguna función leyendo activamente.

## 3. Contenido de Mensajes en Detalle

Discord requiere que los bots soliciten un permiso privilegiado para recibir el contenido de texto de los mensajes. Usamos esto únicamente para operar funciones específicas que lo necesitan para funcionar, como reproducir mensajes destacados en el starboard de un servidor o incluir texto de mensajes en la transcripción de cierre de un ticket.

No almacenamos contenido de mensajes más allá de lo que requiere el propio funcionamiento de cada función, no lo leemos con ningún propósito fuera de operar estas funciones, y nunca se vende, comparte con anunciantes, ni se usa para construir perfiles de usuario. Los administradores del servidor son los únicos responsables del contenido que configuren mediante funciones como tags, embeds y mensajes de bienvenida/despedida, y de cómo el Servicio reenvía o muestra ese contenido a los miembros de su servidor; el Servicio, su creador y su equipo de desarrollo no asumen responsabilidad por dicho contenido.

## 4. Cómo Usamos la Información

Usamos la información anterior únicamente para operar el Servicio y el Servicio Web: ejecutar comandos, persistir la configuración por servidor, autenticar sesiones del Servicio Web, y hacer cumplir qué usuarios pueden configurar qué servidores.

## 5. Dónde se Almacenan los Datos

Los datos de configuración se almacenan en MongoDB (configuración de servidores, tags) y PostgreSQL (recordatorios, giveaways, zonas horarias, registros de auditoría), alojados por proveedores de bases de datos externos. Tu token de sesión del Servicio Web se almacena en el almacenamiento local de tu navegador, no en una cookie, y nunca se transmite a ninguna parte distinta de la API propia del Servicio Web.

## 6. Terceros

Compartimos datos con:
- **Discord Inc.**, según sea necesario para operar el Servicio y el Servicio Web (consulta la propia Política de Privacidad de Discord para saber cómo maneja Discord tus datos).
- Nuestros proveedores de bases de datos y hosting, únicamente como infraestructura para almacenar los datos descritos arriba — no los usan para sus propios fines.

No vendemos tus datos a anunciantes u otros terceros.

## 7. Retención de Datos

La configuración del servidor persiste mientras el Servicio permanezca en ese servidor, o hasta que un administrador la modifique. Algunos datos (como recordatorios pendientes vinculados a un canal o servidor eliminado, o contenido de starboard/transcripciones de tickets vinculado a un mensaje o ticket eliminado) se limpian o eliminan automáticamente junto con aquello a lo que hacen referencia. Para solicitar la eliminación de datos asociados a tu cuenta o servidor, contáctanos a través de nuestro servidor de soporte.

## 8. Privacidad de Menores

El Servicio no está dirigido a menores de 13 años (o la edad mínima requerida por los propios Términos de Servicio de Discord en tu región). No recolectamos conscientemente información de usuarios por debajo de esta edad.

## 9. Tus Derechos

Dependiendo de tu jurisdicción, puedes tener derechos para acceder, corregir o solicitar la eliminación de tus datos. Contáctanos a través de nuestro servidor de soporte para hacer dicha solicitud.

## 10. Cambios a esta Política

Podemos actualizar esta Política de Privacidad periódicamente. La fecha de "Última actualización" en la parte superior de esta página refleja la revisión más reciente.

## 11. Contacto

Preguntas sobre esta Política de Privacidad pueden dirigirse a nuestro servidor de soporte (enlazado en el pie de página de este sitio).