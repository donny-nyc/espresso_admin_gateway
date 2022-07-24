import express, { Request, Response } from 'express';

export abstract class Controller {
  protected req: Request;
  protected res: Response;

  protected abstract executeImpl(): Promise<void | any>;

  public execute(req: Request, res: Response): void {
    this.req = req;
    this.res = res;

    this.executeImpl();
  }

  public static jsonResponse(res: Response, code: number, message: string) {
    return res.status(code).json({ message });
  }

  public const STATUS_OK = 200;
  public ok<T>(res: Response, dto?: T) {
    if(!!dto) {
      res.send(STATUS_OK).json({ dto });
    } else {
      res.sendStatus(STATUS_OK);
    }
  }

  public const STATUS_CREATED = 201;
  public created(res: Response, dto?: T) {
    res.sendStatus(STATUS_CREATED);
  }

  public const STATUS_BAD_REQUEST = 400;
  public badRequest(message = "Bad Request") {
    return BaseController.jsonResponse(this.res, STATUS_BAD_REQUEST, message);
  }

  public const STATUS_UNAUTHORIZED = 400;
  public unauthorized(message = "Unauthorized") {
    return BaseController.jsonResponse(this.res, STATUS_UNAUTHORIZED, message);
  }

  public const STATUS_FORBIDDEN = 403;
  public forbidden(message = "Forbidden") {
    return BaseController.jsonResponse(this.res, STATUS_FORBIDDEN, message);
  }

  public const STATUS_NOT_FOUND = 404;
  public notFound(message = "Not Found") {
    return BaseController.jsonResponse(this.res, STATUS_NOT_FOUND, message);
  }

  public const STATUS_RATE_LIMIT = 429;
  public rateLimit(message = "Too many requests") {
    return BaseController.jsonResponse(this.res, STATUS_RATE_LIMIT, message);
  }

  public const STATUS_SERVER_ERROR = 500;
  public fail(error: Error | string) {
    console.log(error);
    return this.status(STATUS_SERVER_ERROR).json({
      message: error.toString();
    });
  }
}
