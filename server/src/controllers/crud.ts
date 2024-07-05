import {ModelClass, Model, Page} from 'objection';
import {Request, Response} from 'express';
import {bind} from 'helpful-decorators';
import {responseFormat, responsePageFormat} from '../services/response-handler';
import _ from 'lodash';

export default class CrudController<M extends Model> {
  private table: ModelClass<M>;

  constructor(table: ModelClass<M>) {
    this.table = table;
  }

  @bind
  public *create(req: Request, res: Response): Generator {
    const items = yield this.table.query().insert(req.body);
    res.send(responseFormat(items));
  }

  @bind
  public *readAll(req: Request, res: Response): Generator<unknown, any, Page<any>> {
    let page = _.toNumber(req.query.page);
    const pageSize: number = _.toNumber(req.query.page_size);
    const result: Page<any> = yield this.table.query().page(page ? page - 1 : 0, pageSize);
    res.send(responsePageFormat(result, page, pageSize));
  }

  @bind
  public *read(req: Request, res: Response): Generator {
    const item = yield this.table.query().findById(req.params.id);
    res.send(responseFormat(item));
  }

  @bind
  public *update(req: Request, res: Response): Generator {
    const item = yield this.table.query().patchAndFetchById(req.params.id, req.body);
    res.send(responseFormat(item));
  }

  @bind
  public *delete(req: Request, res: Response): Generator {
    yield this.table.query().deleteById(req.params.id);
    res.send(responseFormat());
  }
}
