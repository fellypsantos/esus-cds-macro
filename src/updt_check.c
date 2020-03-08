#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <sys/stat.h>
#include <sys/types.h>

time_t getFileLastModifiedDate(char *path) {
    struct stat attr;
    stat(path, &attr);
    return attr.st_mtime;
}

void main(int argc, char *argv[]) {

  if (argc == 1) {
    printf("NEED_PRODUCTION_PATH");
    return;
  }

  char  *server_file_path = argv[1];
  time_t server_file_time = getFileLastModifiedDate(server_file_path);
  time_t local_file_time = getFileLastModifiedDate("macro.bundle.js");
  double difference = difftime(server_file_time, local_file_time);

  // printf("Server File: %s \n", ctime(&server_file_time));
  // printf("Local File : %s \n", ctime(&local_file_time));

  if (difference > 0) {
    printf("NEED_UPDATE");
  }
  else {
    printf("UPDATED");
  }
}
