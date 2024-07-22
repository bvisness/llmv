#pragma once

#include <stddef.h>
#include <stdint.h>

/*
LLMV's utility C library allows you to write binary data into wasm memory to be
read and displayed by the JS library. Because the finer points of visualization
often require you to create DOM nodes, the C library only attempts to
streamline the process of walking structs and getting the raw structural data
over to your JS code.
*/

#define _TOKENPASTE(a, b) a##b
#define TOKENPASTE(a, b) _TOKENPASTE(a, b)

typedef struct llmv_writer {
  unsigned char *buf;
  size_t cap;
  size_t len;
  int err;
} llmv_writer;

llmv_writer llmv_new_writer(unsigned char *buf, size_t size);

int llmv_start(llmv_writer *w, const char *kind, const void *addr, size_t size);
int llmv_field(llmv_writer *w, const char *name, const char *type,
               const void *addr, size_t size);
int llmv_end(llmv_writer *w);
int llmv_close(llmv_writer *w);

#define llmv_start_struct(w, kind, ps) llmv_start(w, kind, ps, sizeof(*ps))

#define llmv_structfield(w, s, type, field)                                    \
  _Pragma("clang diagnostic push")                                             \
      _Pragma("clang diagnostic ignored \"-Wunused-variable\"")                \
          type TOKENPASTE(_structfield_, __LINE__) = s->field;                 \
  _Pragma("clang diagnostic pop")                                              \
      llmv_field(w, #field, #type, &s->field, sizeof(s->field))

#define llmv_cstring(w, s)                                                     \
  llmv_start(w, "cstring", s, strlen(s) + 1);                                  \
  llmv_end(w);
