import { PaginatedEntity } from "../dto/paginated-entities";
import { IPaginatedType, PageInfo } from "../dto/pagination";

export function mapEntitiesToPaginatedDto<T>(
  entities: T[],
  offset: number,
  limit: number,
  totalCount: number,
): IPaginatedType<T> {
  const paginatedDto: PaginatedEntity<T> = new PaginatedEntity<T>();
  paginatedDto.result = entities;
  paginatedDto.totalCount = totalCount;

  paginatedDto.pageInfo = new PageInfo();
  paginatedDto.pageInfo.limit = limit;
  paginatedDto.pageInfo.offset = offset;
  paginatedDto.pageInfo.hasNextPage = totalCount - offset > limit;
  paginatedDto.pageInfo.hasPreviousPage = !!offset;

  return paginatedDto;
}
