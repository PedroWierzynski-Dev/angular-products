import { Component, OnInit } from '@angular/core';
import { Product } from '../product.model';
import { ProductService } from '../product.service';
import { SharedModule } from '../../shared/shared.module';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  searchTerm: string = '';
  selectedCategory: string = '';
  categories: string[] = [];
  private searchSubject = new Subject<string>();
  private allProducts: Product[] = [];

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    this.loadProducts();

    this.searchSubject.pipe(
      debounceTime(300)
    ).subscribe(() => {
      this.searchProducts();
    });
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe(
      products => {
        this.allProducts = products.map(product => ({ ...product, expanded: false }));
        this.products = [...this.allProducts];
        this.populateCategories();
      },
      error => {
        console.error('Erro ao carregar produtos:', error);
      }
    );
  }

  searchProducts(): void {
    let filteredProducts = [...this.allProducts];

    if (this.searchTerm) {
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    if (this.selectedCategory) {
      filteredProducts = filteredProducts.filter(product => product.category === this.selectedCategory);
    }

    this.products = filteredProducts;
  }

  populateCategories(): void {
    this.categories = [...new Set(this.allProducts.map(p => p.category))];
  }

  deleteProduct(id: number): void {
    this.productService.deleteProduct(id).subscribe(() => {
      this.loadProducts();
    });
  }

  toggleDescription(product: any) {
    product.expanded = !product.expanded;
  }

  onSearchTermChanged(): void {
    this.searchSubject.next(this.searchTerm);
  }
}