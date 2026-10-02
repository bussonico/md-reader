# Guía de Markdown

Una referencia completa para escribir documentos en formato Markdown.

---

## Encabezados

Los encabezados se crean con el símbolo `#`. Cuantos más `#`, menor es el nivel.

### Nivel 3

Los niveles 1, 2 y 3 son los más comunes. Este lector los muestra en la tabla de contenidos.

---

## Texto

El texto normal se escribe directamente. Para **negritas** usa doble asterisco. Para *cursivas* usa asterisco simple. También puedes combinarlos: ***negrita y cursiva***.

Para tachar texto usa ~~doble tilde~~.

El texto `en código inline` se rodea con backticks.

---

## Listas

### Lista sin orden

- Primer elemento
- Segundo elemento
  - Elemento anidado
  - Otro anidado
- Tercer elemento

### Lista ordenada

1. Primera tarea
2. Segunda tarea
3. Tercera tarea

### Lista de tareas

- [x] Tarea completada
- [ ] Tarea pendiente
- [ ] Otra pendiente

---

## Tablas

Las tablas se crean con barras verticales y guiones:

| Sintaxis | Resultado | Uso |
|----------|-----------|-----|
| `**texto**` | **texto** | Negrita |
| `*texto*` | *texto* | Cursiva |
| `# título` | Encabezado H1 | Título principal |
| `## título` | Encabezado H2 | Sección |
| `[link](url)` | [link](url) | Hipervínculo |
| `![alt](img)` | imagen | Imagen |

---

## Bloques de código

### Inline

Usa backtick simple para código `inline`.

### Bloque

Para bloques de código, usa triple backtick con el lenguaje:

```javascript
function saludar(nombre) {
  return `Hola, ${nombre}!`
}

const resultado = saludar('Mundo')
console.log(resultado) // Hola, Mundo!
```

```python
def calcular_fibonacci(n):
    if n <= 1:
        return n
    return calcular_fibonacci(n-1) + calcular_fibonacci(n-2)

print(calcular_fibonacci(10))  # 55
```

---

## Citas

Las citas se crean con el símbolo `>`:

> Esta es una cita simple.

> Las citas pueden tener múltiples líneas.
> Basta con continuar usando el símbolo `>`.
>
> Incluso pueden tener párrafos separados.

> **Nota:** Las citas también soportan **formato** interno, como *cursivas* o `código`.

---

## Separadores

Un separador horizontal se crea con tres guiones `---`, tres asteriscos `***` o tres guiones bajos `___`:

---

## Links

- [Link simple](https://example.com)
- [Link con título](https://example.com "Título al pasar el cursor")
- Link automático: <https://example.com>

---

## Reglas importantes

1. **Una línea en blanco** separa párrafos.
2. **Dos espacios** al final de una línea crean un salto de línea sin párrafo nuevo.
3. Los emojis son compatibles: ✅ 🚀 📖
4. El **HTML inline** también puede usarse en Markdown, aunque este lector lo sanitiza por seguridad.

---

## Flujo de trabajo recomendado

Para escribir documentos largos en Markdown:

1. Comienza con el encabezado H1 (el título)
2. Organiza el contenido en secciones con H2
3. Usa H3 para subsecciones cuando sea necesario
4. Mantén los párrafos cortos y concisos
5. Usa listas para información enumerada
6. Reserva las tablas para datos comparativos
7. Las citas son ideales para resaltar ideas clave

---

*Este documento es una muestra incluida en MD Reader.*
