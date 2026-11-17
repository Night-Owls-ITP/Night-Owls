import {
  DynamicModule,
  Inject,
  Injectable,
  Module,
  OnApplicationShutdown,
  Type,
} from '@nestjs/common';
import { DataSource, DataSourceOptions, EntityTarget } from 'typeorm';

type TypeOrmModuleOptions = DataSourceOptions & {
  autoLoadEntities?: boolean;
};

interface TypeOrmAsyncOptions {
  inject?: Array<string | symbol | Type<unknown>>;
  useFactory: (
    ...dependencies: never[]
  ) => Promise<TypeOrmModuleOptions> | TypeOrmModuleOptions;
}

const entities = new Set<EntityTarget<unknown>>();

export function getRepositoryToken(
  entity: string | { readonly name: string },
  dataSource = 'default',
): string {
  const entityName = typeof entity === 'string' ? entity : entity.name;
  const prefix = dataSource === 'default' ? '' : `${dataSource}_`;
  return `${prefix}${entityName}Repository`;
}

export function InjectRepository(
  entity: string | { readonly name: string },
  dataSource = 'default',
): ParameterDecorator {
  return Inject(getRepositoryToken(entity, dataSource));
}

export function InjectDataSource(): ParameterDecorator {
  return Inject(DataSource);
}

@Injectable()
class DataSourceShutdown implements OnApplicationShutdown {
  constructor(@Inject(DataSource) private readonly dataSource: DataSource) {}

  async onApplicationShutdown(): Promise<void> {
    if (this.dataSource.isInitialized) {
      await this.dataSource.destroy();
    }
  }
}

@Module({})
export class TypeOrmModule {
  static forRootAsync(options: TypeOrmAsyncOptions): DynamicModule {
    return {
      module: TypeOrmModule,
      global: true,
      providers: [
        DataSourceShutdown,
        {
          provide: DataSource,
          inject: options.inject ?? [],
          useFactory: async (...dependencies: never[]) => {
            const { autoLoadEntities, ...dataSourceOptions } =
              await options.useFactory(...dependencies);
            return new DataSource({
              ...dataSourceOptions,
              entities: autoLoadEntities
                ? [...entities]
                : dataSourceOptions.entities,
            }).initialize();
          },
        },
      ],
      exports: [DataSource],
    };
  }

  static forFeature(featureEntities: EntityTarget<unknown>[]): DynamicModule {
    for (const entity of featureEntities) {
      entities.add(entity);
    }

    const providers = featureEntities.map((entity) => ({
      provide: getRepositoryToken(entity as { readonly name: string }),
      inject: [DataSource],
      useFactory: (dataSource: DataSource) => dataSource.getRepository(entity),
    }));

    return {
      module: TypeOrmModule,
      providers,
      exports: providers,
    };
  }
}
