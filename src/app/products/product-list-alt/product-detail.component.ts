import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ProductService} from '../product.service';
import {catchError, combineLatest, EMPTY, filter, map, Subject} from "rxjs";

@Component({
  selector: 'pm-product-detail',
  templateUrl: './product-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductDetailComponent {
    private errorMessage = new Subject<string>();
    errorMessage$ = this.errorMessage.asObservable();

  productSuppliers$ = this.productService.selectProductSuppliers$.pipe(
      catchError(err => {
          this.errorMessage = err;
          return EMPTY;
      })
  );

  product$ = this.productService.selectedProduct$.pipe(
      catchError(err => {
        this.errorMessage = err;
        return EMPTY;
      })
  );

  productTitle$ = this.product$.pipe(map(product => product?.productName?"Product detail:" + product.productName : null));

  vm$ = combineLatest([this.product$, this.productSuppliers$, this.productTitle$])
      .pipe(
          filter(([product]) => Boolean(product)),
          map(([product, filter, title])=> ({ product, filter, title}))
      );

  constructor(private productService: ProductService) { }

}
