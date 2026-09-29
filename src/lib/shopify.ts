// src/lib/shopify.ts
export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  availableForSale: boolean;
  price: string;
  currencyCode: string;
  imageUrl: string;
  variantId: string;
  checkoutUrl: string;
}

const PRODUCTS_QUERY = `
  query GetStorefrontProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          handle
          description
          availableForSale
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          featuredImage {
            url
            altText
          }
          variants(first: 1) {
            edges {
              node {
                id
                title
                availableForSale
                price {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
  }
`;

export async function fetchShopifyProducts(domain?: string, token?: string, limit: number = 20): Promise<ShopifyProduct[]> {
  const isMock = !domain || !token;
  const endpoint = isMock 
    ? 'https://mock.shop/api'
    : `https://${domain.replace(/^https?:\/\//, '').replace(/\/$/, '')}/api/2024-07/graphql.json`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (!isMock && token) {
    headers['X-Shopify-Storefront-Access-Token'] = token;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query: PRODUCTS_QUERY,
      variables: { first: limit }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Shopify API error (${response.status}): ${errorText}`);
  }

  const json = await response.json();
  if (json.errors && json.errors.length > 0) {
    throw new Error(json.errors[0].message || 'Error en GraphQL de Shopify');
  }

  const edges = json.data?.products?.edges || [];
  return edges.map(({ node }: any) => {
    const firstVariant = node.variants?.edges?.[0]?.node;
    const variantGid = firstVariant?.id || '';
    // Extraer ID numérico de variant GID tipo gid://shopify/ProductVariant/12345678
    const variantNumericId = variantGid.split('/').pop() || '';
    const cleanDomain = domain ? domain.replace(/^https?:\/\//, '').replace(/\/$/, '') : 'mock.shop';
    const checkoutUrl = `https://${cleanDomain}/cart/${variantNumericId}:1`;

    return {
      id: node.handle || node.id,
      title: node.title,
      handle: node.handle,
      description: node.description || '',
      availableForSale: node.availableForSale,
      price: node.priceRange?.minVariantPrice?.amount || '0',
      currencyCode: node.priceRange?.minVariantPrice?.currencyCode || 'PEN',
      imageUrl: node.featuredImage?.url || '/images/hero-bg.jpg',
      variantId: variantGid,
      checkoutUrl,
    };
  });
}
