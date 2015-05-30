CC = gcc
SRCS = main.c
OBJS = $(SRCS:.c=.o)
INCLUDES =
LIBDIRS =
LIBS = -lparse
TARGET = gio

all: $(TARGET)

$(TARGET): $(OBJS) 
	$(CC) $(LIBDIRS) $(OBJS) -o $(TARGET) $(LIBS)

.c.o:
	$(CC) $(CFLAGS) $(INCLUDES) -c $< -o $@

clean:
	rm -fR $(TARGET) $(OBJS)

