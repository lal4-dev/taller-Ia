# 📚 Especificación de la Capa de Servicios y API

La aplicación aísla toda la lógica de negocio y comunicación con Supabase en la carpeta `src/services/`. Esta capa garantiza que si en el futuro se cambia la base de datos o el proveedor de autenticación, la interfaz de usuario permanece intacta.

---

## 1. Servicio de Autenticación (`authService.ts`)

Encargado de la gestión del ciclo de vida de la sesión del usuario.

| Método | Parámetros | Retorno | Descripción |
| :--- | :--- | :--- | :--- |
| `signUp` | `email: string, password: string` | `Promise<{ user, session }>` | Registra un nuevo usuario con credenciales. |
| `signIn` | `email: string, password: string` | `Promise<{ user, session }>` | Inicia sesión y almacena el JWT en cookies/storage. |
| `signOut` | `void` | `Promise<void>` | Destruye la sesión activa y limpia el estado local. |
| `getUser` | `void` | `Promise<User \| null>` | Obtiene el usuario actualmente autenticado. |
| `onAuthStateChange` | `callback: (event, session) => void` | `Subscription` | Escucha cambios de autenticación en tiempo real. |

---

## 2. Servicio de Tareas (`todoService.ts`)

Encargado de las operaciones de persistencia y filtrado sobre la tabla `todos`.

| Método | Parámetros | Retorno | Descripción |
| :--- | :--- | :--- | :--- |
| `getTodos` | `filter?: TodoFilter` | `Promise<Todo[]>` | Obtiene la lista de tareas del usuario actual ordenadas. |
| `createTodo` | `payload: CreateTodoDTO` | `Promise<Todo>` | Inserta una nueva tarea asociada automáticamente al `auth.uid()`. |
| `toggleTodo` | `id: string, isCompleted: boolean` | `Promise<Todo>` | Cambia el estado completado/pendiente de una tarea. |
| `updateTodo` | `id: string, updates: Partial<Todo>` | `Promise<Todo>` | Modifica título, descripción o prioridad de una tarea. |
| `deleteTodo` | `id: string` | `Promise<void>` | Elimina una tarea por su ID único. |
| `getTodoStats` | `void` | `Promise<TodoStats>` | Calcula métricas agregadas (totales, completadas, pendientes, % progreso). |

---

## 3. Manejo de Excepciones

Todos los métodos de los servicios capturan y normalizan errores provenientes de Supabase:
- Errores de red / conexión.
- Errores de validación de campos.
- Errores de autorización / violación de políticas RLS.
- Transformación a mensajes amigables para el usuario final en español.
