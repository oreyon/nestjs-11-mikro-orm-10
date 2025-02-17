export class WebResponse<T> {
  message?: string;
  data?: T;
  errors?: string;
  paging?: Paging;
}

export class Paging {
  size: number | undefined;
  totalPage: number | undefined;
  currentPage: number | undefined;
}
