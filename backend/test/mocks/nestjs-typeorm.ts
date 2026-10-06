import { Inject } from '@nestjs/common';

type RepositoryTarget = string | { readonly name: string };

export function getRepositoryToken(
  entity: RepositoryTarget,
  dataSource: string = 'default',
): string {
  const entityName = typeof entity === 'string' ? entity : entity.name;
  const prefix = dataSource === 'default' ? '' : `${dataSource}_`;

  return `${prefix}${entityName}Repository`;
}

export function InjectRepository(
  entity: RepositoryTarget,
  dataSource: string = 'default',
): ParameterDecorator {
  return Inject(getRepositoryToken(entity, dataSource));
}
