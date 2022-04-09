import {ChangeDetectionStrategy, Component} from '@angular/core';

import {catchError, EMPTY, Subject} from 'rxjs';
import {ProductService} from '../product.service';

@Component({
  selector: 'pm-product-list',
  templateUrl: './product-list-alt.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListAltComponent {

    private errorMessage = new Subject<string>();
    errorMessage$ = this.errorMessage.asObservable();

  pageTitle = 'Products';

  products$ = this.productService.productsWithAdd$.pipe(
      catchError(err => {
        this.errorMessage.next(err);
        return EMPTY;
      }))

  selectedProduct$ = this.productService.selectedProduct$;

  constructor(private productService: ProductService) { }

  onSelected(productId: number): void {
    this.productService.selectedProductChange(productId);
  }
}
