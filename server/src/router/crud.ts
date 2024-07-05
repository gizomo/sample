import {ModelClass, Model} from 'objection';
import Token from '../models/token';
import User from '../models/user';
import Form from '../models/form';
import Input from '../models/input';
import Validator from '../models/validator';
import AuthController from '../controllers/auth';
import CrudController from '../controllers/crud';
import Express from 'express';

const models: ModelClass<Model>[] = [User, Token, Form, Input, Validator];

const useCrud = function (router: Express.Router): Express.Router {
  models.forEach((model: ModelClass<Model>) => {
    const routeForModel = `/${model.name.toLowerCase()}`;
    const routeForTable = `/${model.tableName.toLowerCase()}`;
    const controller = new CrudController(model);

    router.post(routeForModel, controller.create);
    // router.get(routeForTable, AuthController.guard, controller.readAll);
    router.get(routeForTable, controller.readAll);
    router.get(routeForModel + '/:id', controller.read);
    router.patch(routeForModel + '/:id', controller.update);
    router.delete(routeForModel + '/:id', controller.delete);
  });

  return router;
};

export default useCrud;
