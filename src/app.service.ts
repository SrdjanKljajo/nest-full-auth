import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Healthcheck!!';
  }

  getNewBranch(): string {
    return 'New branch!';
  }
}
