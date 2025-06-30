#include <stdio.h>
// gcc hello.c -o hello
// chmod +x hello
// ./hello

int main() {
  int age = 15;
  float length = 2.4;
  char alphabet = 'c';
  printf("age = 0x%x\n", age);
  printf("length = %f\n", length);
  printf("length = %d\n", (int)length);
  printf("alphabet = %d\n", alphabet);
  return 0;
}
