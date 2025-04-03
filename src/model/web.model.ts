export class WebResponse<T> {
  message?: string;
  data?: T;
  errors?: string | Array<{ validation: string; message: string }>;
  paging?: Paging;
}

export class Paging {
  size!: number;
  totalPage!: number;
  currentPage!: number;
}
