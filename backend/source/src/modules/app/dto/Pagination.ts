import { Type } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

@Expose()
export class PageInfo {
  @ApiProperty()
  offset: number;

  @ApiProperty()
  limit: number;

  @ApiProperty({
    description: "Tells whether there are results after the current page.",
  })
  hasNextPage: boolean;

  @ApiProperty({
    description: "Tells whether there are results before current page.",
  })
  hasPreviousPage: boolean;
}

export interface IPaginatedType<T> {
  totalCount?: number;
  pageInfo?: PageInfo;
  result?: T[];
}

export function Paginated<T>(classRef: Type<T>): Type<IPaginatedType<T>> {
  @Expose()
  abstract class PaginatedType implements IPaginatedType<T> {
    @ApiProperty({ description: "Total count of returned records." })
    totalCount: number;

    @ApiProperty({ type: PageInfo })
    pageInfo: PageInfo;

    @ApiProperty({ type: [classRef] })
    result: T[];
  }
  return PaginatedType as Type<IPaginatedType<T>>;
}
