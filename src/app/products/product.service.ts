import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import {
    BehaviorSubject,
    catchError,
    combineLatest, filter, forkJoin,
    map,
    merge,
    Observable, of,
    scan,
    shareReplay,
    Subject, switchMap,
    tap,
    throwError
} from 'rxjs';

import { Product } from './product';
import {ProductCategoryService} from "../product-categories/product-category.service";
import {SupplierService} from "../suppliers/supplier.service";
import {Supplier} from "../suppliers/supplier";

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private productsUrl = 'api/products';
  private suppliersUrl = 'api/suppliers';

  product$ = this.http.get<Product[]>(this.productsUrl)
      .pipe(
    /*      map(products => products.map(product =>
              {
                product.price = product.price ? product.price * 1.5 : 0;
                product.searchKey = [product.productName];
                return product;
              })),*/
/*          map(products => products.map(product =>
                ({
                  ...product,
                  price: product.price?product.price * 1.5 : 0,
                  searchKey: [product.productName]

                } as Product))),*/
          tap(data => console.log('Products: ', JSON.stringify(data))),
          catchError(this.handleError)
      );

  productsWithCategory$ = combineLatest([this.product$, this.productCategoryService.productCategories$])
      .pipe(
          map(([products, categories]) =>
              products.map(product => ({
                ...product,
                price: product.price?product.price * 1.5 : 0,
                category : categories.find(category => category.id == product.categoryId)?.name,
                searchKey: [product.productName]
              }))),
          shareReplay(1)
      )

    private productSelectedSubject = new BehaviorSubject<number>(0);
    productSelectedAction$ = this.productSelectedSubject.asObservable();

    selectedProduct$ = combineLatest([this.productSelectedAction$,this.productsWithCategory$])
        .pipe(
            map(([selectedProductId, products]) =>
                products.find(prod => prod.id === selectedProductId)),
            tap(prod => console.log("selectProd", prod)),
            shareReplay(1)
        );

    private productInsertedSubject = new Subject<Product>();
    productInsertedAction$ = this.productInsertedSubject.asObservable();

    productsWithAdd$ = merge(this.productsWithCategory$, this.productInsertedAction$)
        .pipe(
            scan((acc, value) => (value instanceof Array)?[...value]:[...acc,value],[] as Product[])
        )

/*    selectProductSuppliers$ = combineLatest(this.selectedProduct$, this.supplierService.suppliers$)
        .pipe(
            map(([selectedProduct, suppliers]) =>
                suppliers.filter(supplier => selectedProduct?.supplierIds?.includes(supplier.id))
            ),
            shareReplay(1)
        )*/

    selectProductSuppliers$ = this.selectedProduct$
        .pipe(
            filter(product => Boolean(product)),
            switchMap(selectedProduct => {
                if(selectedProduct?.supplierIds){
                    return forkJoin(selectedProduct.supplierIds.map(supplierId => this.http.get<Supplier>(this.suppliersUrl + "/" + supplierId)))
                }
                else
                {
                    return of([]);
                }
            }))
  
  constructor(private http: HttpClient,
              private productCategoryService: ProductCategoryService,
              private supplierService: SupplierService) { }

      public selectedProductChange(productId: number){
        this.productSelectedSubject.next(productId);
      }

    public addProduct(product?: Product){
        product = product || this.fakeProduct();
        this.productInsertedSubject.next(product);
    }

      private fakeProduct(): Product {
        return {
          id: 42,
          productName: 'Another One',
          productCode: 'TBX-0042',
          description: 'Our new product',
          price: 8.9,
          categoryId: 3, category: 'Toolbox',
          quantityInStock: 30
        };
      }

      private handleError(err: HttpErrorResponse): Observable<never> {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    let errorMessage: string;
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Backend returned code ${err.status}: ${err.message}`;
    }
    console.error(err);
    return throwError(() => errorMessage);
  }

}
