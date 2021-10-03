import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserDto } from 'src/users/dtos/user.dto';

export class SerializeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
    // Run something before a request is handled by req handler
    console.log("I'm running before the handler", context);

    return handler.handle().pipe(
      map((data: any) => {
        // Run something before the response is sent out
        console.log("I'm running before the response is sent out", data);
        return plainToClass(UserDto, data, { excludeExtraneousValues: true });
      }),
    );
  }
}
