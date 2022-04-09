import {ChangeDetectionStrategy, Component} from '@angular/core';

import {catchError, combineLatest, EMPTY, map, startWith, Subject} from 'rxjs';
import {ProductCategory} from '../product-categories/product-category';
import {ProductService} from './product.service';
import {ProductCategoryService} from "../product-categories/product-category.service";

@Component({
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent {
  pageTitle = 'Product List';
  errorMessage = '';
  categories: ProductCategory[] = [];
/*  selectedCategoryId: number = 1;*/

    private categorySelectedSubject = new Subject<number>();//BehaviorSubject start with 0
    categorySelectedAction$ = this.categorySelectedSubject.asObservable();

    products$ = combineLatest(
        [this.productService.productsWithAdd$,
                 this.categorySelectedAction$.pipe(startWith(0))])
        .pipe(
            map(([products, selectedCategoryId]) => products.filter(prod => selectedCategoryId? selectedCategoryId === prod.categoryId : true)),
            catchError(err => {
                this.errorMessage = err;
                return EMPTY;
            })
        );

      category$ = this.productCategoryService.productCategories$.pipe(
          catchError(err => {
            this.errorMessage = err;
            return EMPTY;
          })
      );



/*  productSimpleFilter$ = this.productService.productsWithCategory$
      .pipe(
          map(products => products.filter(product => product.categoryId? product.categoryId === this.selectedCategoryId : true))
      );*/

  constructor(private productService: ProductService,
              private productCategoryService: ProductCategoryService) { }

  onAdd(): void {
    this.productService.addProduct();
  }

  onSelected(categoryId: string): void {
      this.categorySelectedSubject.next(+categoryId);
  }
}
