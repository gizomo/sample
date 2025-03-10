import {bind} from 'helpful-decorators';
import {Store, createStore, createEvent, Event, Effect, createEffect} from 'effector';
import {isEmpty} from 'shared/lib/helpers';
import ApiResponse from 'shared/api/response';

export default abstract class AbstractStore<Model> {
  protected $store: Store<Model>;
  protected $errors?: SomeObjectType;

  public load: Effect<void, Model, Error> = createEffect(() => Promise.resolve(undefined as any));
  public update: Event<Model> = createEvent();
  public clear: Event<void> = createEvent();

  constructor() {
    this.$store = createStore<Model>(null as Model)
      .on([this.load.doneData, this.update], this.updateStore)
      .reset(this.clear);
  }

  protected abstract updateStore(state: Model, data: Model): Model;

  protected get isEmpty(): boolean {
    return isEmpty(this.$store.getState());
  }

  protected get hasErrors(): boolean {
    return !isEmpty(this.$errors);
  }

  protected setErrors(errors: SomeObjectType | undefined): void {
    this.$errors = errors;
  }

  public getStore(): Model {
    return this.$store.getState();
  }

  public clearStore(): void {
    this.clear();
    this.clearErrors();
  }

  public clearErrors(): void {
    this.setErrors(undefined);
  }

  @bind
  public reject(response: ApiResponse): Promise<SomeObjectType> {
    this.setErrors(response.getErrors());
    return Promise.reject(response);
  }
}
