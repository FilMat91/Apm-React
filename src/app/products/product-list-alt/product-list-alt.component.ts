import {Component} from '@angular/core';

import {catchError, EMPTY} from 'rxjs';
import { ProductService } from '../product.service';
import {ChangeDetectionStrategy} from "@angular/compiler";

@Component({
  selector: 'pm-product-list',
  templateUrl: './product-list-alt.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListAltComponent {
  pageTitle = 'Products';
  errorMessage = '';

  products$ = this.productService.productsWithCategory$.pipe(
      catchError(err => {
        this.errorMessage = err;
        return EMPTY;
      }))

  selectedProduct$ = this.productService.selectedProduct$;

  constructor(private productService: ProductService) { }

  onSelected(productId: number): void {
    this.productService.selectedProductChange(productId);
  }
}
